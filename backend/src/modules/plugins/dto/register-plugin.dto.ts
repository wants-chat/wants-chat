import { PluginManifest } from '../interfaces';

export class RegisterPluginDto {
  manifest: PluginManifest;
}

export class PluginFilterDto {
  search?: string;
  author?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}
