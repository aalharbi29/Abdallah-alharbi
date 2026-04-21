import React from 'react';
import { ENTITIES_CATALOG } from './entitiesCatalog';

export default function RequestTypeSelector({ selectedEntity, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {ENTITIES_CATALOG.map((ent) => {
        const isActive = selectedEntity === ent.value;
        return (
          <button
            key={ent.value}
            type="button"
            onClick={() => onSelect(isActive ? '' : ent.value)}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              isActive
                ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-2xl mb-1">{ent.icon}</div>
            <div className={`text-xs font-medium ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
              {ent.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}