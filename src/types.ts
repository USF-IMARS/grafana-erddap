type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  base_url: string;
  product_id: string;
  variable_id: string;
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
  color_bar_str: string;
  bg_color: string;
  n_images: number;
  show_request_dates: boolean;
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
