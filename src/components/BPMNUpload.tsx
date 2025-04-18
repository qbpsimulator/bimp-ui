// src/components/BPMNUpload.tsx

import React from 'react';
import { UploadCloud } from 'lucide-react';

export const BPMNUpload = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
          <UploadCloud className="w-12 h-12 text-blue-600 mb-4" />
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            BPMN файл сонгох
          </label>
          <input id="file-upload" type="file" accept=".bpmn" className="hidden" />
          <p className="mt-4 text-sm text-gray-500">эсвэл энд чирж тавь</p>
          <p className="mt-2 text-gray-400 text-xs">Одоогоор файл сонгогдоогүй байна.</p>
          <button className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Үргэлжлүүлэх
          </button>
        </div>

        {/* Instructions Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Зааварчилгаа</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>BPMN 2.0 загварын зөв файл сонгоно уу.</li>
            <li><strong>Үргэлжлүүлэх</strong> товчийг дарж симуляцийн мэдээллийг нэмэх эсвэл өөрчлөх.</li>
            <li><strong>"Лог үүсгэх"</strong> сонголтыг идэвхжүүлснээр MXML симуляцийн лог татаж авах боломжтой болно.</li>
            <li><strong>Симуляци эхлүүлэх</strong> товчийг дарна.</li>
            <li>Үр дүнг шинжилнэ.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
  
export default BPMNUpload;
