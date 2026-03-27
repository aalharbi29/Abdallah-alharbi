import React from "react";

export default function LayoutStyles() {
  return (
    <style>{`
      * {
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .font-cairo {
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      @media print {
        .no-print, .print-hide { display: none !important; }
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print-only { display: block !important; }
        .print-title { display: block !important; }
        body { background: white !important; color: black !important; }
        main, .print-area { padding: 0 !important; margin: 0 !important; }
        @page {
          size: A4;
          margin: 20mm;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          font-size: 10pt;
        }
        th {
          background-color: #f2f2f2;
        }
      }

      .print-title { display: none; }
      .print-only { display: none; }

      @media (max-width: 1023px) {
        .responsive-shell {
          overflow-x: hidden;
        }

        .responsive-header {
          position: sticky;
          top: 0;
          z-index: 30;
        }
      }

      @media (max-width: 767px) {
        .responsive-shell {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        }

        .mobile-app-header {
          padding-left: 12px !important;
          padding-right: 12px !important;
          min-height: 64px;
        }

        .mobile-bottom-nav-shell {
          position: sticky;
          bottom: 0;
          z-index: 35;
        }

        main {
          padding: 8px 8px 84px 8px !important;
        }

        .responsive-toolbar {
          gap: 6px !important;
        }

        .responsive-toolbar > * {
          transform: scale(0.95);
          transform-origin: center;
        }

        .app-page-stack {
          gap: 10px !important;
        }

        .app-page-stack > .rounded-xl,
        .app-page-stack > .rounded-2xl,
        .app-page-stack > [class*="shadow"] {
          margin-bottom: 0 !important;
        }
      }

      @media (min-width: 768px) and (max-width: 1023px) {
        body {
          font-size: 15px;
          overflow-x: hidden;
        }

        .mobile-title {
          font-size: 17px !important;
          line-height: 1.25 !important;
        }

        .mobile-text {
          font-size: 13px !important;
          line-height: 1.45 !important;
        }

        .mobile-card {
          border-radius: 10px !important;
          padding: 12px !important;
        }

        .mobile-button {
          height: 38px !important;
          font-size: 12px !important;
          padding: 6px 12px !important;
        }

        .mobile-table th,
        .mobile-table td {
          padding: 6px 4px !important;
          font-size: 11px !important;
          min-width: 90px !important;
        }
      }

      @media (max-width: 767px) {
        body {
          font-size: 14px;
          overflow-x: hidden;
        }

        input, textarea, select {
          font-size: 16px !important;
        }

        .mobile-card {
          margin: 1px !important;
          border-radius: 6px !important;
          padding: 8px !important;
        }

        .page-card-grid {
          gap: 8px !important;
        }

        .page-card-grid > * {
          min-width: 0;
        }

        .mobile-text,
        .mobile-paragraph {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }

        .mobile-paragraph {
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .mobile-title {
          font-size: 16px !important;
          line-height: 1.2 !important;
        }

        .mobile-button {
          height: 36px !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
          min-width: 60px !important;
        }

        .mobile-nav-item {
          min-height: 40px !important;
          font-size: 10px !important;
          padding: 6px 2px !important;
        }

        .mobile-table th,
        .mobile-table td {
          padding: 4px !important;
          font-size: 10px !important;
          min-width: 80px !important;
        }

        .mobile-stats-card {
          padding: 8px !important;
        }

        .mobile-stats-value {
          font-size: 18px !important;
        }

        .mobile-stats-title {
          font-size: 10px !important;
        }

        .compact-page-section {
          margin-bottom: 8px !important;
        }

        .compact-page-section:last-child {
          margin-bottom: 0 !important;
        }

        .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .dialog-content-mobile {
          max-width: 95vw !important;
          max-height: 90vh !important;
          margin: 2vw !important;
        }

        .card-mobile {
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }

        .btn-mobile {
          min-height: 44px !important;
          touch-action: manipulation;
        }

        .form-mobile input,
        .form-mobile select,
        .form-mobile textarea {
          min-height: 44px !important;
          font-size: 16px !important;
        }

        .tabs-mobile {
          font-size: 12px !important;
        }

        .space-mobile > * + * {
          margin-top: 8px !important;
        }
      }

      @media (max-width: 480px) {
        .responsive-toolbar {
          gap: 4px !important;
        }

        main {
          padding: 6px 6px 82px 6px !important;
        }

        .mobile-table th,
        .mobile-table td {
          padding: 2px !important;
          font-size: 9px !important;
          min-width: 60px !important;
        }

        .mobile-button {
          height: 32px !important;
          font-size: 10px !important;
          padding: 4px 6px !important;
          min-width: 50px !important;
        }

        .mobile-title {
          font-size: 14px !important;
        }

        .mobile-text,
        .mobile-paragraph {
          font-size: 11px !important;
        }

        .mobile-paragraph.compact,
        .compact.mobile-paragraph {
          font-size: 10px !important;
          line-height: 1.25 !important;
        }
      }

      .safe-area-inset {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
      }

      @media (display-mode: standalone) {
        body {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
      }

      .safe-top { padding-top: env(safe-area-inset-top); }
      .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .mobile-overlay {
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.5);
      }

      .bottom-nav {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-top: 1px solid #e5e7eb;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .touch-target {
        min-width: 44px;
        min-height: 44px;
      }

      main:focus {
        outline: none;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      p, li, span, h1, h2, h3, h4, h5, h6 {
        overflow-wrap: break-word;
      }

      .app-page-stack,
      .page-card-grid,
      .compact-page-section {
        width: 100%;
      }

      @media (max-width: 767px) {
        table {
          font-size: 12px;
        }

        th, td {
          padding: 4px 2px !important;
          word-break: break-word;
        }
      }
    `}</style>
  );
}