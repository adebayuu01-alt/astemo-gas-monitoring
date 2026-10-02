import React, { useState } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * Ant Design DatePicker with custom left sidebar (Daily, Monthly, Yearly) matching Image 2
 * Shows only the selected date in the trigger button (without 'Daily:' prefix) matching Image 3
 */
export default function CustomDatePickerModal({
  selectedMode = 'daily', // 'daily' | 'monthly' | 'yearly'
  selectedDate = dayjs('2026-09-07'),
  onChangeMode,
  onChangeDate
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(selectedMode);

  // Map active tab to Ant Design DatePicker picker prop
  const pickerMode = activeTab === 'daily' ? 'date' : activeTab === 'monthly' ? 'month' : 'year';

  const handleTabChange = (mode) => {
    setActiveTab(mode);
    if (onChangeMode) onChangeMode(mode);
  };

  const handleChange = (date) => {
    if (date) {
      if (onChangeDate) onChangeDate(date);
      setOpen(false);
    }
  };

  // Ant Design Date Format: displays ONLY the selected date value (no 'Daily:' prefix)
  const format = activeTab === 'daily' ? 'DD MMM YYYY' : activeTab === 'monthly' ? 'MMM YYYY' : 'YYYY';

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
        },
        components: {
          DatePicker: {
            cellActiveWithRangeBg: '#EAF8F1',
            cellHoverBg: '#F2F4F7',
            colorLink: '#00A854',
            colorLinkHover: '#008C45'
          }
        }
      }}
    >
      <DatePicker
        open={open}
        onOpenChange={(v) => setOpen(v)}
        value={selectedDate}
        onChange={handleChange}
        picker={pickerMode}
        format={format}
        allowClear={false}
        prefix={<CalendarIcon className="w-4 h-4 text-[#00A854] mr-1.5 shrink-0" />}
        suffixIcon={
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        }
        className="h-[38px] border-[#D0D5DD] hover:border-[#00A854] focus:border-[#00A854] rounded-lg shadow-xs cursor-pointer font-semibold text-xs text-[#1E232F] w-[170px] sm:w-[185px] bg-white"
        popupClassName="ant-gas-datepicker-popup"
        panelRender={(originPanel) => (
          <div className="flex bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Left Sidebar with Daily, Monthly, Yearly tabs (Image 2) */}
            <div className="w-[105px] p-3 flex flex-col gap-2.5 border-r border-gray-200 bg-white select-none">
              <button
                type="button"
                onClick={() => handleTabChange('daily')}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  activeTab === 'daily'
                    ? 'bg-[#00A854] text-white shadow-xs'
                    : 'text-[#1E232F] hover:bg-gray-100'
                }`}
              >
                Daily
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('monthly')}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  activeTab === 'monthly'
                    ? 'bg-[#00A854] text-white shadow-xs'
                    : 'text-[#1E232F] hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('yearly')}
                className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                  activeTab === 'yearly'
                    ? 'bg-[#00A854] text-white shadow-xs'
                    : 'text-[#1E232F] hover:bg-gray-100'
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Right: Ant Design's native calendar panel */}
            <div className="flex-1 p-2 select-none">
              {originPanel}
            </div>
          </div>
        )}
      />
    </ConfigProvider>
  );
}
