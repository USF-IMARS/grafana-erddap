import React, { useEffect, useState } from 'react';
import { PanelPlugin, PanelProps, dateTime, DateTime } from '@grafana/data';
import { SimpleOptions } from './types';
import { css } from '@emotion/css';
import { HorizontalGroup, VerticalGroup } from '@grafana/ui';

interface ERDDAPURL {
  display: string;
  link: string;
  request_time: string;
}

const dt_display_fmt = 'Do MMM YYYY';

// CSS for loading spinner
const spinnerStyle = css`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(204, 204, 220, 0.25);
  border-radius: 50%;
  border-top-color: #5794f2;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// CSS for loading container
const loadingContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
`;

// CSS for loading text
const loadingTextStyle = css`
  font-size: 12px;
  margin-top: 10px;
  color: #999;
  text-align: center;
`;

const buildUrls = (options: SimpleOptions, timeRange: { from: string; to: string }): ERDDAPURL[] => {
  const {
    base_url,
    product_id,
    variable_id,
    lat_min,
    lat_max,
    lon_min,
    lon_max,
    color_bar_str,
    n_images,
  } = options;

  const urls: ERDDAPURL[] = [];
  const t_0 = dateTime(timeRange.from);
  const t_f = dateTime(timeRange.to);

  // calculate total time range in seconds
  const totalSeconds = t_f.diff(t_0, 'seconds');

  // Instead of a time-based while loop, use a for loop to ensure exactly n_images are created
  for (let i = 0; i < n_images; i++) {
    // Calculate the fraction of the way through the time range (0 to 1)
    const fraction = n_images > 1 ? i / (n_images - 1) : 0;
    
    // Calculate the exact time for this image
    const secondsOffset = totalSeconds * fraction;
    const time = t_0.add(secondsOffset, 'seconds');

    const url = {
      display: getUrl(time, 'Bottom', 'png', '|', {
        base_url,
        product_id,
        variable_id,
        lat_min,
        lat_max,
        lon_min,
        lon_max,
        color_bar_str,
      }),
      link: getUrl(time, 'Bottom', 'largePng', '|', {
        base_url,
        product_id,
        variable_id,
        lat_min,
        lat_max,
        lon_min,
        lon_max,
        color_bar_str,
      }),
      request_time: time.format(dt_display_fmt),
    };
    urls.push(url);
  }

  return urls;
};

const getUrl = (
  time: DateTime,
  legend: string,
  format: string,
  sizeStr: string,
  options: {
    base_url: string;
    product_id: string;
    variable_id: string;
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
    color_bar_str: string;
  }
): string => {
  const { base_url, product_id, variable_id, lat_min, lat_max, lon_min, lon_max, color_bar_str } = options;

  let constructed_url = `${base_url}/griddap/${product_id}.${format}`;
  constructed_url += `?${variable_id}`;
  constructed_url += `[(${time.format('YYYY-MM-DDTHH:mm:00[Z]')})]`;
  constructed_url += `[(${lat_min}):(${lat_max})]`;
  constructed_url += `[(${lon_min}):(${lon_max})]`;

  constructed_url +=
    '&' +
    encodeData({
      '.draw': 'surface',
      '.vars': `longitude|latitude|${variable_id}`,
      '.colorBar': color_bar_str,
      '.trim': '1',
      '.legend': legend,
      '.size': sizeStr,
    });

  return constructed_url;
};

const encodeData = (data: Record<string, string>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

export const SimplePanel = ({ options, timeRange, width, height }: PanelProps<SimpleOptions>) => {
  const [urls, setUrls] = useState<ERDDAPURL[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      setLoadedImages({});
      const builtUrls = buildUrls(options, {
        from: timeRange.from.toISOString(),
        to: timeRange.to.toISOString(),
      });
      setUrls(builtUrls);
    } catch (error) {
      console.error('Error building URLs:', error);
    }
  }, [options, timeRange]);

  // Calculate image width based on panel width and number of images
  const imageWidth = Math.floor((width - (options.n_images - 1) * 10) / options.n_images); // 10px gap between images

  // Handler for when an image loads
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Define a style for each image container
  const imageContainerStyle = css`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  `;

  return (
    <div
      style={{
        width,
        height,
        overflowY: 'auto',
      }}
    >
      <HorizontalGroup spacing="sm" justify="space-between" align="center">
        {urls.map((url, index) => (
          <div key={index} className={imageContainerStyle}>
            {loadedImages[index] ? (
              <VerticalGroup spacing="xs" align="center">
                <a href={url.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url.display}
                    alt={url.request_time}
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      maxWidth: imageWidth
                    }}
                  />
                </a>
                {options.show_request_dates && <p>{url.request_time}</p>}
              </VerticalGroup>
            ) : (
              <div
                className={loadingContainerStyle}
                style={{
                  width: '100%',
                  maxWidth: imageWidth,
                }}
              >
                <div className={spinnerStyle} />
                <div className={loadingTextStyle}>
                  Loading: {url.request_time}
                </div>
                {/* Hidden image that loads in the background */}
                <img
                  src={url.display}
                  alt={url.request_time}
                  style={{ display: 'none' }}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageLoad(index)} // Also handle errors to avoid stuck loading state
                />
              </div>
            )}
          </div>
        ))}
      </HorizontalGroup>
    </div>
  );
};

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'base_url',
      name: 'Base URL',
      description: 'Base URL for the ERDDAP server',
      defaultValue: 'http://131.247.136.200:8080/erddap',
    })
    .addTextInput({
      path: 'product_id',
      name: 'Product ID',
      defaultValue: 'jplMURSST41anom1day',
    })
    .addTextInput({
      path: 'variable_id',
      name: 'Variable ID',
      defaultValue: 'sstAnom',
    })
    .addNumberInput({
      path: 'lat_min',
      name: 'Minimum Latitude',
      defaultValue: 24.4,
    })
    .addNumberInput({
      path: 'lat_max',
      name: 'Maximum Latitude',
      defaultValue: 25.5,
    })
    .addNumberInput({
      path: 'lon_min',
      name: 'Minimum Longitude',
      defaultValue: -82.2,
    })
    .addNumberInput({
      path: 'lon_max',
      name: 'Maximum Longitude',
      defaultValue: -80.1,
    })
    .addTextInput({
      path: 'color_bar_str',
      name: 'Color Bar String',
      defaultValue: 'Rainbow|C|Linear|0|30|',
    })
    .addNumberInput({
      path: 'n_images',
      name: 'Number of Images',
      description: 'Number of images to display in the time range',
      defaultValue: 6,
      settings: {
        min: 2,
        max: 10,
        integer: true
      }
    })
    .addBooleanSwitch({
      path: 'show_request_dates',
      name: 'Show Request Dates',
      defaultValue: false,
    });
});
