import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Shuffle, Clock, Star, Calendar, RefreshCw, Heart, Info, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface MoviePickerToolProps {
  uiConfig?: UIConfig;
}

type Genre = 'action' | 'comedy' | 'drama' | 'horror' | 'sci-fi' | 'romance' | 'thriller' | 'animation' | 'documentary' | 'fantasy';
type Era = 'classic' | '80s-90s' | '2000s' | '2010s' | 'recent';

interface Movie {
  title: string;
  year: number;
  genre: Genre;
  rating: number;
  duration: number;
  director: string;
  description: string;
}

const movieDatabase: Movie[] = [
  // Action
  { title: 'Die Hard', year: 1988, genre: 'action', rating: 8.2, duration: 132, director: 'John McTiernan', description: 'An NYPD officer tries to save his wife and others taken hostage by German terrorists during a Christmas party.' },
  { title: 'Mad Max: Fury Road', year: 2015, genre: 'action', rating: 8.1, duration: 120, director: 'George Miller', description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland.' },
  { title: 'John Wick', year: 2014, genre: 'action', rating: 7.4, duration: 101, director: 'Chad Stahelski', description: 'An ex-hitman comes out of retirement to track down the gangsters who killed his dog.' },
  { title: 'The Dark Knight', year: 2008, genre: 'action', rating: 9.0, duration: 152, director: 'Christopher Nolan', description: 'Batman must accept one of the greatest tests of his ability to fight injustice.' },
  { title: 'Top Gun: Maverick', year: 2022, genre: 'action', rating: 8.3, duration: 130, director: 'Joseph Kosinski', description: 'After more than 30 years, Maverick is still pushing the envelope as a top naval aviator.' },

  // Comedy
  { title: 'Superbad', year: 2007, genre: 'comedy', rating: 7.6, duration: 113, director: 'Greg Mottola', description: 'Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to party fails.' },
  { title: 'The Grand Budapest Hotel', year: 2014, genre: 'comedy', rating: 8.1, duration: 99, director: 'Wes Anderson', description: 'A writer encounters the owner of an aging high-class hotel and recalls its former glory.' },
  { title: 'Bridesmaids', year: 2011, genre: 'comedy', rating: 6.8, duration: 125, director: 'Paul Feig', description: 'Competition between bridesmaids threatens to derail a wedding.' },
  { title: 'Groundhog Day', year: 1993, genre: 'comedy', rating: 8.0, duration: 101, director: 'Harold Ramis', description: 'A weatherman finds himself inexplicably living the same day over and over again.' },
  { title: 'The Hangover', year: 2009, genre: 'comedy', rating: 7.7, duration: 100, director: 'Todd Phillips', description: 'Three buddies wake up from a bachelor party in Las Vegas with no memory and the bachelor missing.' },

  // Drama
  { title: 'The Shawshank Redemption', year: 1994, genre: 'drama', rating: 9.3, duration: 142, director: 'Frank Darabont', description: 'Two imprisoned men bond over several years, finding solace and eventual redemption.' },
  { title: 'Parasite', year: 2019, genre: 'drama', rating: 8.5, duration: 132, director: 'Bong Joon-ho', description: 'Greed and class discrimination threaten the newly formed relationship between the wealthy Park family and the destitute Kim clan.' },
  { title: 'Forrest Gump', year: 1994, genre: 'drama', rating: 8.8, duration: 142, director: 'Robert Zemeckis', description: 'The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.' },
  { title: 'The Godfather', year: 1972, genre: 'drama', rating: 9.2, duration: 175, director: 'Francis Ford Coppola', description: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.' },
  { title: 'Whiplash', year: 2014, genre: 'drama', rating: 8.5, duration: 106, director: 'Damien Chazelle', description: 'A promising young drummer enrolls at a cut-throat music conservatory.' },

  // Horror
  { title: 'Get Out', year: 2017, genre: 'horror', rating: 7.7, duration: 104, director: 'Jordan Peele', description: 'A young African-American visits his white girlfriend\'s parents for the weekend.' },
  { title: 'The Shining', year: 1980, genre: 'horror', rating: 8.4, duration: 146, director: 'Stanley Kubrick', description: 'A family heads to an isolated hotel for the winter where a sinister presence influences the father.' },
  { title: 'Hereditary', year: 2018, genre: 'horror', rating: 7.3, duration: 127, director: 'Ari Aster', description: 'A grieving family is haunted by tragic and disturbing occurrences.' },
  { title: 'A Quiet Place', year: 2018, genre: 'horror', rating: 7.5, duration: 90, director: 'John Krasinski', description: 'A family must live in silence to avoid mysterious creatures that hunt by sound.' },
  { title: 'The Conjuring', year: 2013, genre: 'horror', rating: 7.5, duration: 112, director: 'James Wan', description: 'Paranormal investigators work to help a family terrorized by a dark presence.' },

  // Sci-Fi
  { title: 'Inception', year: 2010, genre: 'sci-fi', rating: 8.8, duration: 148, director: 'Christopher Nolan', description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.' },
  { title: 'Interstellar', year: 2014, genre: 'sci-fi', rating: 8.6, duration: 169, director: 'Christopher Nolan', description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.' },
  { title: 'Blade Runner 2049', year: 2017, genre: 'sci-fi', rating: 8.0, duration: 164, director: 'Denis Villeneuve', description: 'A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.' },
  { title: 'The Matrix', year: 1999, genre: 'sci-fi', rating: 8.7, duration: 136, director: 'Lana Wachowski', description: 'A computer hacker learns about the true nature of his reality and his role in the war against its controllers.' },
  { title: 'Dune', year: 2021, genre: 'sci-fi', rating: 8.0, duration: 155, director: 'Denis Villeneuve', description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset.' },

  // Romance
  { title: 'Pride and Prejudice', year: 2005, genre: 'romance', rating: 7.8, duration: 129, director: 'Joe Wright', description: 'Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy.' },
  { title: 'La La Land', year: 2016, genre: 'romance', rating: 8.0, duration: 128, director: 'Damien Chazelle', description: 'While navigating their careers, a pianist and an actress fall in love in Los Angeles.' },
  { title: 'The Notebook', year: 2004, genre: 'romance', rating: 7.8, duration: 123, director: 'Nick Cassavetes', description: 'A poor yet passionate young man falls in love with a rich young woman.' },
  { title: 'When Harry Met Sally', year: 1989, genre: 'romance', rating: 7.6, duration: 95, director: 'Rob Reiner', description: 'Harry and Sally have known each other for years, and are very good friends, but wonder if it\'s possible to be just friends.' },
  { title: 'Crazy Rich Asians', year: 2018, genre: 'romance', rating: 6.9, duration: 120, director: 'Jon M. Chu', description: 'This contemporary romantic comedy follows native New Yorker Rachel Chu to Singapore to meet her boyfriend\'s family.' },

  // Thriller
  { title: 'Gone Girl', year: 2014, genre: 'thriller', rating: 8.1, duration: 149, director: 'David Fincher', description: 'With his wife\'s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.' },
  { title: 'Se7en', year: 1995, genre: 'thriller', rating: 8.6, duration: 127, director: 'David Fincher', description: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.' },
  { title: 'Zodiac', year: 2007, genre: 'thriller', rating: 7.7, duration: 157, director: 'David Fincher', description: 'Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer.' },
  { title: 'Prisoners', year: 2013, genre: 'thriller', rating: 8.1, duration: 153, director: 'Denis Villeneuve', description: 'When his daughter and her friend go missing, Keller Dover takes matters into his own hands.' },
  { title: 'Knives Out', year: 2019, genre: 'thriller', rating: 7.9, duration: 130, director: 'Rian Johnson', description: 'A detective investigates the death of a patriarch of an eccentric, combative family.' },

  // Animation
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, genre: 'animation', rating: 8.4, duration: 117, director: 'Peter Ramsey', description: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions.' },
  { title: 'Coco', year: 2017, genre: 'animation', rating: 8.4, duration: 105, director: 'Lee Unkrich', description: 'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary singer.' },
  { title: 'Spirited Away', year: 2001, genre: 'animation', rating: 8.6, duration: 125, director: 'Hayao Miyazaki', description: 'During her family\'s move, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.' },
  { title: 'Toy Story', year: 1995, genre: 'animation', rating: 8.3, duration: 81, director: 'John Lasseter', description: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy.' },
  { title: 'Up', year: 2009, genre: 'animation', rating: 8.2, duration: 96, director: 'Pete Docter', description: '78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons.' },

  // Documentary
  { title: 'Free Solo', year: 2018, genre: 'documentary', rating: 8.2, duration: 100, director: 'Jimmy Chin', description: 'Alex Honnold attempts to become the first person to ever free solo climb El Capitan.' },
  { title: 'The Social Dilemma', year: 2020, genre: 'documentary', rating: 7.6, duration: 94, director: 'Jeff Orlowski', description: 'Explores the dangerous human impact of social networking.' },
  { title: 'My Octopus Teacher', year: 2020, genre: 'documentary', rating: 8.1, duration: 85, director: 'Pippa Ehrlich', description: 'A filmmaker forges an unusual friendship with an octopus living in a South African kelp forest.' },
  { title: 'Jiro Dreams of Sushi', year: 2011, genre: 'documentary', rating: 7.8, duration: 81, director: 'David Gelb', description: 'A documentary on 85-year-old sushi master Jiro Ono, his restaurant in Tokyo, and his relationship with his son.' },
  { title: 'Won\'t You Be My Neighbor?', year: 2018, genre: 'documentary', rating: 8.4, duration: 94, director: 'Morgan Neville', description: 'An exploration of the life, lessons, and legacy of iconic children\'s show host Fred Rogers.' },

  // Fantasy
  { title: 'The Lord of the Rings: Fellowship', year: 2001, genre: 'fantasy', rating: 8.8, duration: 178, director: 'Peter Jackson', description: 'A meek Hobbit sets out on an unexpected journey to the Lonely Mountain with a spirited group.' },
  { title: 'Harry Potter and the Sorcerer\'s Stone', year: 2001, genre: 'fantasy', rating: 7.6, duration: 152, director: 'Chris Columbus', description: 'An orphaned boy enrolls in a school of wizardry.' },
  { title: 'Pan\'s Labyrinth', year: 2006, genre: 'fantasy', rating: 8.2, duration: 118, director: 'Guillermo del Toro', description: 'In the Falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.' },
  { title: 'The Princess Bride', year: 1987, genre: 'fantasy', rating: 8.0, duration: 98, director: 'Rob Reiner', description: 'While home sick in bed, a young boy\'s grandfather reads him the story of a farmboy-turned-pirate.' },
  { title: 'Stardust', year: 2007, genre: 'fantasy', rating: 7.6, duration: 127, director: 'Matthew Vaughn', description: 'In a countryside town, a young man makes a promise to his beloved that he\'ll retrieve a fallen star.' },
];

export const MoviePickerTool: React.FC<MoviePickerToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedGenres, setSelectedGenres] = useState<Set<Genre>>(new Set());
  const [selectedEra, setSelectedEra] = useState<Era | 'all'>('all');
  const [minRating, setMinRating] = useState(0);
  const [maxDuration, setMaxDuration] = useState(300);
  const [pickedMovie, setPickedMovie] = useState<Movie | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      if (params.genre) {
        setSelectedGenres(new Set([params.genre as Genre]));
      }
    }
  }, [uiConfig?.params]);

  const genres: { id: Genre; name: string; emoji: string }[] = [
    { id: 'action', name: 'Action', emoji: '💥' },
    { id: 'comedy', name: 'Comedy', emoji: '😂' },
    { id: 'drama', name: 'Drama', emoji: '🎭' },
    { id: 'horror', name: 'Horror', emoji: '👻' },
    { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀' },
    { id: 'romance', name: 'Romance', emoji: '💕' },
    { id: 'thriller', name: 'Thriller', emoji: '🔪' },
    { id: 'animation', name: 'Animation', emoji: '🎨' },
    { id: 'documentary', name: 'Documentary', emoji: '📹' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙' },
  ];

  const eras: { id: Era | 'all'; name: string; range: [number, number] | null }[] = [
    { id: 'all', name: 'Any Era', range: null },
    { id: 'classic', name: 'Classic (Pre-1980)', range: [0, 1979] },
    { id: '80s-90s', name: '80s-90s', range: [1980, 1999] },
    { id: '2000s', name: '2000s', range: [2000, 2009] },
    { id: '2010s', name: '2010s', range: [2010, 2019] },
    { id: 'recent', name: 'Recent (2020+)', range: [2020, 2100] },
  ];

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(genre)) {
        newSet.delete(genre);
      } else {
        newSet.add(genre);
      }
      return newSet;
    });
  };

  const toggleFavorite = (title: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const filteredMovies = useMemo(() => {
    return movieDatabase.filter((movie) => {
      // Genre filter
      if (selectedGenres.size > 0 && !selectedGenres.has(movie.genre)) {
        return false;
      }

      // Era filter
      const era = eras.find((e) => e.id === selectedEra);
      if (era?.range) {
        if (movie.year < era.range[0] || movie.year > era.range[1]) {
          return false;
        }
      }

      // Rating filter
      if (movie.rating < minRating) {
        return false;
      }

      // Duration filter
      if (movie.duration > maxDuration) {
        return false;
      }

      return true;
    });
  }, [selectedGenres, selectedEra, minRating, maxDuration]);

  const pickRandomMovie = useCallback(() => {
    if (filteredMovies.length === 0) return;

    setIsSpinning(true);
    setPickedMovie(null);

    // Simulate spinning animation
    let spins = 0;
    const maxSpins = 15;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredMovies.length);
      setPickedMovie(filteredMovies[randomIndex]);
      spins++;

      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
      }
    }, 100);
  }, [filteredMovies]);

  const clearFilters = () => {
    setSelectedGenres(new Set());
    setSelectedEra('all');
    setMinRating(0);
    setMaxDuration(300);
  };

  const getGenreEmoji = (genre: Genre) => {
    return genres.find((g) => g.id === genre)?.emoji || '🎬';
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg"><Film className="w-5 h-5 text-teal-500" /></div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.moviePicker.randomMoviePicker', 'Random Movie Picker')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.moviePicker.letFateDecideYourMovie', 'Let fate decide your movie night')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Genre Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Filter className="w-4 h-4 inline mr-1" /> Select Genres (or leave empty for all)
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${
                  selectedGenres.has(genre.id)
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{genre.emoji}</span>
                <span>{genre.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Era Filter */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Calendar className="w-4 h-4 inline mr-1" /> Era
          </label>
          <div className="flex flex-wrap gap-2">
            {eras.map((era) => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedEra === era.id
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rating & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Star className="w-4 h-4 inline mr-1" /> Min Rating: {minRating}+
            </label>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <Clock className="w-4 h-4 inline mr-1" /> Max Duration: {maxDuration} min
            </label>
            <input
              type="range"
              min="60"
              max="300"
              step="15"
              value={maxDuration}
              onChange={(e) => setMaxDuration(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>

        {/* Clear Filters & Pick Button */}
        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('tools.moviePicker.clearFilters', 'Clear Filters')}
          </button>
          <button
            onClick={pickRandomMovie}
            disabled={filteredMovies.length === 0 || isSpinning}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              filteredMovies.length === 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            } ${isSpinning ? 'animate-pulse' : ''}`}
          >
            {isSpinning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Shuffle className="w-5 h-5" />
            )}
            {isSpinning ? 'Picking...' : `Pick from ${filteredMovies.length} movies`}
          </button>
        </div>

        {/* Picked Movie Result */}
        {pickedMovie && (
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getGenreEmoji(pickedMovie.genre)}</span>
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pickedMovie.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pickedMovie.year} | Directed by {pickedMovie.director}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(pickedMovie.title)}
                className={`p-2 rounded-lg ${
                  favorites.has(pickedMovie.title)
                    ? 'text-red-500'
                    : isDark
                    ? 'text-gray-400 hover:text-red-400'
                    : 'text-gray-500 hover:text-red-400'
                }`}
              >
                <Heart className="w-5 h-5" fill={favorites.has(pickedMovie.title) ? t('tools.moviePicker.currentcolor', 'currentColor') : 'none'} />
              </button>
            </div>

            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {pickedMovie.description}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{pickedMovie.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-teal-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{pickedMovie.duration} min</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                {pickedMovie.genre}
              </span>
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.size > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              Your Watchlist ({favorites.size})
            </h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(favorites).map((title) => (
                <span
                  key={title}
                  className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.moviePicker.tip', 'Tip:')}</strong> Can't decide? Clear all filters and let the picker choose from the entire collection.
              Add movies to your watchlist by clicking the heart icon!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePickerTool;
