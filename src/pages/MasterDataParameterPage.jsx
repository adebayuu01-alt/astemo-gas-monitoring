import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import AntDateRangePicker from '../components/AntDateRangePicker';
import ModalPortal from '../components/ModalPortal';
import Toast from '../components/Toast';
import { INITIAL_PARAMETERS } from '../data/mockData';

export default function MasterDataParameterPage() {
  const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [paramName, setParamName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [toast, setToast] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredParams = parameters
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.parameter.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.datetime.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        // Simple date comparison if date selected
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        // Parse date from "DD/MM/YYYY HH:mm"
        const [dPart] = p.datetime.split(' ');
        const [day, month, year] = dPart.split('/');
        const itemDate = new Date(year, month - 1, day);
        if (itemDate < start.toDate() || itemDate > end.toDate()) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const totalEntries = filteredParams.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const paginatedParams = filteredParams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setEditingParam(null);
    setParamName('');
    setUnitName('');
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParam(p);
    setParamName(p.parameter);
    setUnitName(p.unit);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!paramName.trim()) {
      setToast({ type: 'error', title: 'Error', message: 'Parameter name is required.' });
      return;
    }
    if (!unitName.trim()) {
      setToast({ type: 'error', title: 'Error', message: 'Unit is required.' });
      return;
    }

    if (editingParam) {
      setParameters(
        parameters.map((p) =>
          p.id === editingParam.id
            ? { ...p, parameter: paramName.trim(), unit: unitName.trim() }
            : p
        )
      );
      setToast({
        type: 'success',
        title: 'Parameter Updated',
        message: `${paramName} updated successfully.`
      });
    } else {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const formattedDatetime = `${dd}/${mm}/${yyyy} ${hh}:${min}`;

      const newParam = {
        id: Date.now(),
        parameter: paramName.trim(),
        unit: unitName.trim(),
        datetime: formattedDatetime
      };
      setParameters([newParam, ...parameters]);
      setToast({
        type: 'success',
        title: 'Parameter Added',
        message: `${paramName} created successfully.`
      });
    }

    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    const target = parameters.find((p) => p.id === deleteId);
    setParameters(parameters.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setToast({
      type: 'success',
      title: 'Parameter Deleted',
      message: `${target?.parameter || 'Data'} deleted successfully.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm flex-shrink-0">
        <h1 className="text-xl font-bold text-[#1E232F]">Parameter</h1>
        <p className="text-xs text-gray-500 mt-0.5">List parameter data</p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search"
              className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AntDateRangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Data</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#D0D5DD]">
          <table className="w-full text-left border-collapse text-sm font-sans">
            <thead className="bg-[#F2F2F7] border-b border-[#D0D5DD]">
              <tr className="text-[#23262B] font-semibold">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 w-16 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>No</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('parameter')}
                  className="py-3.5 px-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Parameter</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit')}
                  className="py-3.5 px-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Unit</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('datetime')}
                  className="py-3.5 px-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Datetime</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC] bg-white">
              {paginatedParams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No parameter data found.
                  </td>
                </tr>
              ) : (
                paginatedParams.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-600 leading-5">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800 leading-5">
                      {p.parameter}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800 leading-5">
                      {p.unit}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 leading-5">
                      {p.datetime}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 border border-amber-300 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-500 select-none">
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex items-center gap-1 text-xs">
                <span className="px-2.5 py-1 border border-gray-200 rounded text-center min-w-[28px] font-semibold text-gray-700 bg-white">
                  {currentPage}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500 font-medium">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-medium bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Parameter Modal */}
      <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div className="flex items-start justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {editingParam ? 'Edit Parameter' : 'Add Parameter'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                This field is for desc terms of service
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Parameter
              </label>
              <input
                type="text"
                value={paramName}
                onChange={(e) => setParamName(e.target.value)}
                placeholder="Input Parameter"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Input Unit"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-sm font-medium shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Delete Confirmation Modal */}
      <ModalPortal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Parameter</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to delete this parameter? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalPortal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
