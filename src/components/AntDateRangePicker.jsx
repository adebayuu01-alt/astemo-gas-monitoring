import React from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function AntDateRangePicker({
  value,
  onChange,
  className = '',
  placeholder,
  showTime = false,
  format,
  style = {}
}) {
  const defaultFormat = showTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
  const resolvedFormat = format || defaultFormat;
  const defaultPlaceholder = showTime
    ? ['Start date & time', 'End date & time']
    : ['Start date', 'End date'];
  const resolvedPlaceholder = placeholder || defaultPlaceholder;
  const resolvedShowTime = showTime === true ? { format: 'HH:mm' } : showTime;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00A854',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          colorBorder: '#D0D5DD',
          colorTextPlaceholder: '#98A2B3',
          controlHeight: 38
        }
      }}
    >
      <RangePicker
        value={value}
        onChange={onChange}
        placeholder={resolvedPlaceholder}
        format={resolvedFormat}
        showTime={resolvedShowTime}
        className={`ant-custom-range-picker ${className}`}
        style={{
          height: '38px',
          border: '1px solid #D0D5DD',
          borderRadius: '8px',
          padding: '0 12px',
          boxShadow: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          ...style
        }}
      />
    </ConfigProvider>
  );
}
