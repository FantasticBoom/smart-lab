import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
}

export function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  className = '' 
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/70 border-b border-gray-100">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`p-4 text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-sm text-gray-400 font-medium">
                Tidak ada data yang tersedia.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50/40 transition-colors duration-150">
                {columns.map((col, index) => (
                  <td key={index} className={`p-4 text-sm text-gray-600 ${col.className || ''}`}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}