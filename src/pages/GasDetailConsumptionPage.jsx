import React, { useState, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import AntDateRangePicker from '../components/AntDateRangePicker';
import CustomDropdown from '../components/CustomDropdown';
import { INITIAL_SHIFTS } from '../data/mockData';
import { useGasData } from '../context/GasDataContext';

export default function GasDetailConsumptionPage({ onBackToDashboard }) {
  const {
    getDetailRecords,
    stepIndex,
    dashboardShift,
    setDashboardShift,
    dashboardDate
  } = useGasData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState(dashboardShift || 'Shift 1');
  const [dateRange, setDateRange] = useState(null);

  // Sorting state
  const [sortField, setSortField] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const shiftOptions = INITIAL_SHIFTS.map((s) => ({
    label: s.shift,
    value: s.shift
  }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Generate records directly synchronized with the chart data
  const rawRecords = useMemo(() => {
    return getDetailRecords('consumption', selectedShift, dateRange, dashboardDate);
  }, [getDetailRecords, selectedShift, dateRange, dashboardDate, stepIndex]);

  // Filter & sort
  const filteredData = useMemo(() => {
    let list = rawRecords;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.value.toString().includes(q) ||
          item.timestamp.toLowerCase().includes(q)
      );
    }

    if (sortField) {
      list = [...list].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'timestamp') {
          valA = a.rawDate;
          valB = b.rawDate;
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [rawRecords, searchQuery, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleShiftChange = (val) => {
    setSelectedShift(val);
    setDashboardShift?.(val);
    setCurrentPage(1);
  };

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      {/* Header Card with Breadcrumb */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#1E232F]">Gas Tank Consumption Detail</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View and monitor historical gas tank consumption data
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold select-none">
          <button
            onClick={onBackToDashboard}
            className="text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <span className="text-gray-400">&gt;</span>
          <span className="text-[#00A854]">Gas Tank Consumption Detail</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-5 lg:p-6 shadow-sm space-y-4">
        {/* Table Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-[38px] pl-9 pr-8 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#1E232F] placeholder-gray-400 focus:outline-none focus:border-[#00A854] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-28 sm:w-32">
              <CustomDropdown
                value={selectedShift}
                onChange={handleShiftChange}
                options={shiftOptions}
                placeholder="Shift 1"
              />
            </div>

            <AntDateRangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setCurrentPage(1);
              }}
              placeholder={['Start date', 'End date']}
              className="w-[280px] sm:w-[310px]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#D0D5DD]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F2F2F7] border-b border-[#D0D5DD]">
              <tr className="text-[#23262B] font-semibold">
                <th className="py-3 px-4 w-20" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1 cursor-pointer select-none">
                    <span>No</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'id' ? 'text-[#00A854]' : 'text-gray-400'}`} />
                  </div>
                </th>
                <th className="py-3 px-4" onClick={() => handleSort('value')}>
                  <div className="flex items-center gap-1 cursor-pointer select-none">
                    <span>Consumption</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'value' ? 'text-[#00A854]' : 'text-gray-400'}`} />
                  </div>
                </th>
                <th className="py-3 px-4" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center gap-1 cursor-pointer select-none">
                    <span>Timestamp</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortField === 'timestamp' ? 'text-[#00A854]' : 'text-gray-400'}`} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E232F]">
                      {row.value}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {row.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {totalEntries === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-700">
              {Math.min(currentPage * itemsPerPage, totalEntries)}
            </span>{' '}
            of <span className="font-semibold text-gray-700">{totalEntries}</span> entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-semibold text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
