import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue, Job, QueueEvents, JobsOptions, ConnectionOptions } from 'bullmq';
import {
  QUEUE_NAMES,
  QueueName,
  JOB_STATUS,
  JobStatus,
  QUEUE_EVENTS,
  DEFAULT_JOB_OPTIONS,
  BaseJobData,
  ResearchJobData,
  BrowserJobData,
  DocumentJobData,
  DataAnalysisJobData,
} from './queue.constants';

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

export interface JobInfo {
  id: string;
  name: string;
  data: any;
  status: JobStatus;
  progress: number;
  attemptsMade: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  returnValue?: any;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connectionConfig: ConnectionOptions;
  private queues: Map<QueueName, Queue> = new Map();
  private queueEvents: Map<QueueName, QueueEvents> = new Map();
  private isReady = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    // Check if Redis is configured before attempting connection
    const redisHost = this.configService.get<string>('REDIS_HOST');
    if (!redisHost) {
      this.logger.warn('REDIS_HOST not configured - queue service disabled');
      return;
    }

    this.initializeConnectionConfig();

    // Initialize queues in background to not block app startup
    this.initializeQueuesAsync();
  }

  private async initializeQueuesAsync(): Promise<void> {
    try {
      await this.initializeQueues();
      this.setupEventListeners();
      this.isReady = true;
      this.logger.log('Queue service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize queues:', error.message);
      this.logger.warn('App will continue without queue functionality');
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down queue service...');

    // Close all queue events
    for (const [name, queueEvents] of this.queueEvents.entries()) {
      try {
        await queueEvents.close();
        this.logger.debug(`Closed queue events for: ${name}`);
      } catch (error) {
        this.logger.error(`Error closing queue events for ${name}:`, error);
      }
    }

    // Close all queues
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.close();
        this.logger.debug(`Closed queue: ${name}`);
      } catch (error) {
        this.logger.error(`Error closing queue ${name}:`, error);
      }
    }

    this.logger.log('Queue service shut down');
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  private initializeConnectionConfig(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.connectionConfig = {
      host,
      port,
      password: password || undefined,
      db,
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    };

    this.logger.log(`Redis configuration: ${host}:${port}`);
  }

  private async initializeQueues(): Promise<void> {
    const queueNames = Object.values(QUEUE_NAMES);

    for (const queueName of queueNames) {
      const queue = new Queue(queueName, {
        connection: this.connectionConfig,
        defaultJobOptions: {
          ...DEFAULT_JOB_OPTIONS,
        },
      });

      const queueEvents = new QueueEvents(queueName, {
        connection: this.connectionConfig,
      });

      this.queues.set(queueName, queue);
      this.queueEvents.set(queueName, queueEvents);

      this.logger.log(`Queue initialized: ${queueName}`);
    }
  }

  private setupEventListeners(): void {
    for (const [queueName, queueEvents] of this.queueEvents.entries()) {
      queueEvents.on('completed', ({ jobId, returnvalue }) => {
        this.logger.debug(`Job ${jobId} completed in queue ${queueName}`);
        this.eventEmitter.emit(QUEUE_EVENTS.JOB_COMPLETED, {
          queue: queueName,
          jobId,
          result: returnvalue,
        });
      });

      queueEvents.on('failed', ({ jobId, failedReason }) => {
        this.logger.warn(
          `Job ${jobId} failed in queue ${queueName}: ${failedReason}`,
        );
        this.eventEmitter.emit(QUEUE_EVENTS.JOB_FAILED, {
          queue: queueName,
          jobId,
          error: failedReason,
        });
      });

      queueEvents.on('progress', ({ jobId, data }) => {
        this.logger.debug(
          `Job ${jobId} progress in queue ${queueName}: ${JSON.stringify(data)}`,
        );
        this.eventEmitter.emit(QUEUE_EVENTS.JOB_PROGRESS, {
          queue: queueName,
          jobId,
          progress: data,
        });
      });

      queueEvents.on('stalled', ({ jobId }) => {
        this.logger.warn(`Job ${jobId} stalled in queue ${queueName}`);
        this.eventEmitter.emit(QUEUE_EVENTS.JOB_STALLED, {
          queue: queueName,
          jobId,
        });
      });

      queueEvents.on('delayed', ({ jobId, delay }) => {
        this.logger.debug(
          `Job ${jobId} delayed by ${delay}ms in queue ${queueName}`,
        );
        this.eventEmitter.emit(QUEUE_EVENTS.JOB_DELAYED, {
          queue: queueName,
          jobId,
          delay,
        });
      });
    }
  }

  // =============================================
  // QUEUE GETTERS
  // =============================================

  getQueue(name: QueueName): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue "${name}" not found`);
    }
    return queue;
  }

  getResearchQueue(): Queue {
    return this.getQueue(QUEUE_NAMES.RESEARCH);
  }

  getBrowserQueue(): Queue {
    return this.getQueue(QUEUE_NAMES.BROWSER_TASKS);
  }

  getDocumentQueue(): Queue {
    return this.getQueue(QUEUE_NAMES.DOCUMENT_GENERATION);
  }

  getDataAnalysisQueue(): Queue {
    return this.getQueue(QUEUE_NAMES.DATA_ANALYSIS);
  }

  getConnectionConfig(): ConnectionOptions {
    return this.connectionConfig;
  }

  // =============================================
  // JOB MANAGEMENT
  // =============================================

  async addJob<T extends BaseJobData>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);

    const jobData = {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    const job = await queue.add(jobName, jobData, {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
    });

    this.logger.log(
      `Job added to ${queueName}: ${job.id} (${jobName})`,
    );
    this.eventEmitter.emit(QUEUE_EVENTS.JOB_ADDED, {
      queue: queueName,
      jobId: job.id,
      jobName,
      data: jobData,
    });

    return job;
  }

  async addResearchJob(
    jobName: string,
    data: ResearchJobData,
    options?: JobsOptions,
  ): Promise<Job<ResearchJobData>> {
    return this.addJob(QUEUE_NAMES.RESEARCH, jobName, data, options);
  }

  async addBrowserJob(
    jobName: string,
    data: BrowserJobData,
    options?: JobsOptions,
  ): Promise<Job<BrowserJobData>> {
    return this.addJob(QUEUE_NAMES.BROWSER_TASKS, jobName, data, options);
  }

  async addDocumentJob(
    jobName: string,
    data: DocumentJobData,
    options?: JobsOptions,
  ): Promise<Job<DocumentJobData>> {
    return this.addJob(QUEUE_NAMES.DOCUMENT_GENERATION, jobName, data, options);
  }

  async addDataAnalysisJob(
    jobName: string,
    data: DataAnalysisJobData,
    options?: JobsOptions,
  ): Promise<Job<DataAnalysisJobData>> {
    return this.addJob(QUEUE_NAMES.DATA_ANALYSIS, jobName, data, options);
  }

  async addBulkJobs<T extends BaseJobData>(
    queueName: QueueName,
    jobs: Array<{ name: string; data: T; opts?: JobsOptions }>,
  ): Promise<Job<T>[]> {
    const queue = this.getQueue(queueName);

    const formattedJobs = jobs.map((job) => ({
      name: job.name,
      data: {
        ...job.data,
        createdAt: job.data.createdAt || new Date().toISOString(),
      },
      opts: {
        ...DEFAULT_JOB_OPTIONS,
        ...job.opts,
      },
    }));

    const addedJobs = await queue.addBulk(formattedJobs);

    this.logger.log(
      `${addedJobs.length} bulk jobs added to ${queueName}`,
    );

    return addedJobs;
  }

  // =============================================
  // JOB STATUS & RETRIEVAL
  // =============================================

  async getJobStatus(
    queueName: QueueName,
    jobId: string,
  ): Promise<JobInfo | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      id: job.id || '',
      name: job.name,
      data: job.data,
      status: state as JobStatus,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnValue: job.returnvalue,
    };
  }

  async getJob(queueName: QueueName, jobId: string): Promise<Job | null> {
    const queue = this.getQueue(queueName);
    return queue.getJob(jobId);
  }

  async getJobs(
    queueName: QueueName,
    status: JobStatus | JobStatus[],
    start = 0,
    end = 100,
  ): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    const statuses = Array.isArray(status) ? status : [status];
    // Cast JobStatus to the expected BullMQ job state type
    return queue.getJobs(statuses as any, start, end);
  }

  async getActiveJobs(queueName: QueueName): Promise<Job[]> {
    return this.getJobs(queueName, JOB_STATUS.ACTIVE);
  }

  async getWaitingJobs(queueName: QueueName): Promise<Job[]> {
    return this.getJobs(queueName, JOB_STATUS.WAITING);
  }

  async getCompletedJobs(
    queueName: QueueName,
    start = 0,
    end = 100,
  ): Promise<Job[]> {
    return this.getJobs(queueName, JOB_STATUS.COMPLETED, start, end);
  }

  async getFailedJobs(
    queueName: QueueName,
    start = 0,
    end = 100,
  ): Promise<Job[]> {
    return this.getJobs(queueName, JOB_STATUS.FAILED, start, end);
  }

  // =============================================
  // JOB CONTROL
  // =============================================

  async cancelJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);

    if (!job) {
      return false;
    }

    const state = await job.getState();

    if (state === 'active') {
      // For active jobs, we can only mark them for cancellation
      // The worker needs to check for cancellation
      await job.updateProgress({ cancelled: true });
      this.logger.log(`Job ${jobId} marked for cancellation`);
      return true;
    }

    if (state === 'waiting' || state === 'delayed') {
      await job.remove();
      this.logger.log(`Job ${jobId} removed from queue`);
      this.eventEmitter.emit(QUEUE_EVENTS.JOB_REMOVED, {
        queue: queueName,
        jobId,
      });
      return true;
    }

    return false;
  }

  async retryJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);

    if (!job) {
      return false;
    }

    const state = await job.getState();

    if (state === 'failed') {
      await job.retry();
      this.logger.log(`Job ${jobId} retried`);
      return true;
    }

    return false;
  }

  async removeJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);

    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.log(`Job ${jobId} removed`);
    this.eventEmitter.emit(QUEUE_EVENTS.JOB_REMOVED, {
      queue: queueName,
      jobId,
    });
    return true;
  }

  async promoteJob(queueName: QueueName, jobId: string): Promise<boolean> {
    const job = await this.getJob(queueName, jobId);

    if (!job) {
      return false;
    }

    const state = await job.getState();

    if (state === 'delayed') {
      await job.promote();
      this.logger.log(`Job ${jobId} promoted`);
      return true;
    }

    return false;
  }

  // =============================================
  // QUEUE STATISTICS
  // =============================================

  async getQueueStats(queueName: QueueName): Promise<QueueStats> {
    const queue = this.getQueue(queueName);
    const counts = await queue.getJobCounts();

    return {
      name: queueName,
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
      paused: counts.paused || 0,
    };
  }

  async getAllQueueStats(): Promise<QueueStats[]> {
    const stats: QueueStats[] = [];

    for (const queueName of Object.values(QUEUE_NAMES)) {
      const queueStats = await this.getQueueStats(queueName);
      stats.push(queueStats);
    }

    return stats;
  }

  async getJobCounts(queueName: QueueName): Promise<Record<string, number>> {
    const queue = this.getQueue(queueName);
    return queue.getJobCounts();
  }

  // =============================================
  // QUEUE CONTROL
  // =============================================

  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.log(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  async drainQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.drain();
    this.logger.log(`Queue ${queueName} drained`);
  }

  async cleanQueue(
    queueName: QueueName,
    grace: number,
    limit: number,
    status: 'completed' | 'failed' | 'delayed' | 'wait' | 'active' = 'completed',
  ): Promise<string[]> {
    const queue = this.getQueue(queueName);
    const removed = await queue.clean(grace, limit, status);
    this.logger.log(
      `Cleaned ${removed.length} ${status} jobs from ${queueName}`,
    );
    return removed;
  }

  async obliterateQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.obliterate({ force: true });
    this.logger.log(`Queue ${queueName} obliterated`);
  }

  // =============================================
  // USER-SPECIFIC JOBS
  // =============================================

  async getUserJobs(
    queueName: QueueName,
    userId: string,
    statuses: JobStatus[] = [JOB_STATUS.WAITING, JOB_STATUS.ACTIVE],
  ): Promise<Job[]> {
    const jobs = await this.getJobs(queueName, statuses, 0, 1000);
    return jobs.filter((job) => job.data?.userId === userId);
  }

  async cancelUserJobs(queueName: QueueName, userId: string): Promise<number> {
    const jobs = await this.getUserJobs(queueName, userId);
    let cancelledCount = 0;

    for (const job of jobs) {
      const cancelled = await this.cancelJob(queueName, job.id || '');
      if (cancelled) {
        cancelledCount++;
      }
    }

    this.logger.log(
      `Cancelled ${cancelledCount} jobs for user ${userId} in ${queueName}`,
    );
    return cancelledCount;
  }

  // =============================================
  // HEALTH CHECK
  // =============================================

  isServiceReady(): boolean {
    return this.isReady;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    queues: Record<string, boolean>;
  }> {
    const queueHealth: Record<string, boolean> = {};

    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.getJobCounts();
        queueHealth[name] = true;
      } catch (error) {
        queueHealth[name] = false;
        this.logger.error(`Queue ${name} health check failed:`, error.message);
      }
    }

    const allQueuesHealthy = Object.values(queueHealth).every((h) => h);

    return {
      status: allQueuesHealthy ? 'healthy' : 'unhealthy',
      queues: queueHealth,
    };
  }
}
