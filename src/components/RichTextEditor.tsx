"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Yükleme sırasında client-side özel kütüphanelerde hata çıkmaması için dynamic import
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl border border-gray-200"></div>
});

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "clean"],
      ],
    }),
    []
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden [&_.quill]:font-sans [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-sm">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "İçeriği buraya yazın..."}
      />
    </div>
  );
}
