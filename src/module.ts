import React, { useEffect, useState } from 'react';
import { PanelPlugin, PanelProps, dateTime, DateTime } from '@grafana/data';
import { SimpleOptions } from './types';
import { LoadingBar } from '@grafana/ui';

interface ERDDAPURL {
  display: string;
  link: string;
  request_time: string;
}

const dt_display_fmt = 'Do MMM YYYY';

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
    bg_color,
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
        bg_color,
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
        bg_color,
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
    bg_color: string;
  }
): string => {
  const { base_url, product_id, variable_id, lat_min, lat_max, lon_min, lon_max, color_bar_str, bg_color } = options;

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
      '.bgColor': bg_color,
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
  const [loading, setLoading] = useState<boolean>(true);
  const [loadedImages, setLoadedImages] = useState<number>(0);

  useEffect(() => {
    try {
      setLoading(true);
      setLoadedImages(0);
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
  const handleImageLoad = () => {
    setLoadedImages(prev => {
      const newCount = prev + 1;
      if (newCount >= urls.length && urls.length > 0) {
        setLoading(false);
      }
      return newCount;
    });
  };

  // Calculate loading progress percentage
  const loadingPercentage = urls.length > 0 ? loadedImages / urls.length : 0;

  return React.createElement(
    'div',
    { 
      style: { 
        width, 
        height, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      } 
    },
    loading && React.createElement(
      'div',
      {
        style: {
          padding: '10px 0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }
      },
      React.createElement(
        'div',
        {
          style: {
            width: Math.min(400, width - 40),
            marginBottom: '10px',
          }
        },
        React.createElement(LoadingBar, { width: Math.min(400, width - 40) })
      ),
      React.createElement(
        'div',
        {
          style: {
            fontSize: '12px',
          }
        },
        `Loading images: ${loadedImages}/${urls.length} (${Math.round(loadingPercentage * 100)}%)`
      )
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center',
          flexGrow: 1,
        }
      },
      urls.map((url, index) =>
        React.createElement(
          'div',
          { 
            key: index,
            style: {
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }
          },
          React.createElement(
            'a',
            { href: url.link, target: '_blank', rel: 'noopener noreferrer' },
            React.createElement('img', {
              src: url.display,
              alt: url.request_time,
              style: { 
                width: '100%',
                height: 'auto',
                maxWidth: imageWidth
              },
              onLoad: handleImageLoad,
              onError: handleImageLoad, // Also count errors to avoid stuck loading state
            })
          ),
          options.show_request_dates && React.createElement('p', null, url.request_time)
        )
      )
    )
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
    .addTextInput({
      path: 'bg_color',
      name: 'Background Color',
      defaultValue: '0xFFFFFFFF',
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
