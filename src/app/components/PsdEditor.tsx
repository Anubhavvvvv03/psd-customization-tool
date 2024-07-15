"use client";
// components/PsdEditor.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect } from 'react-konva';
import { readPsd } from 'ag-psd';
import useImage from 'use-image';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid';

const PsdEditor: React.FC = () => {
  const [psdImage, setPsdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [texts, setTexts] = useState<any[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<any>(null);
  const logoTransformerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const selectedTextRef = useRef<any>(null);

  const boundary = {
    x: 50,
    y: 50,
    width: 700,
    height: 500
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const psd = readPsd(arrayBuffer);

      const canvas = document.createElement('canvas');
      canvas.width = psd.width;
      canvas.height = psd.height;
      const ctx = canvas.getContext('2d');

      if (ctx && psd.canvas) {
        ctx.drawImage(psd.canvas, 0, 0);
        const imageURL = canvas.toDataURL();
        setPsdImage(imageURL);
      }
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (transformerRef.current && selectedTextRef.current) {
      transformerRef.current.nodes([selectedTextRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [texts, selectedTextId]);

  useEffect(() => {
    if (logoTransformerRef.current && logoRef.current) {
      logoTransformerRef.current.nodes([logoRef.current]);
      logoTransformerRef.current.getLayer().batchDraw();
    }
  }, [logo]);

  const handleFontChange = (selectedOption: any) => {
    updateText(selectedTextId, { fontFamily: selectedOption.value });
  };

  const toggleTextStyle = (style: string) => {
    const selectedText = texts.find((text) => text.id === selectedTextId);
    if (!selectedText) return;

    const currentFontStyle = selectedText.fontStyle || '';
    let updatedFontStyle = currentFontStyle.split(' ');

    if (style === 'bold') {
      updatedFontStyle = updatedFontStyle.includes('bold')
        ? updatedFontStyle.filter((s: any) => s !== 'bold')
        : [...updatedFontStyle, 'bold'];
    } else if (style === 'italic') {
      updatedFontStyle = updatedFontStyle.includes('italic')
        ? updatedFontStyle.filter((s: any) => s !== 'italic')
        : [...updatedFontStyle, 'italic'];
    }

    updateText(selectedTextId, { fontStyle: updatedFontStyle.join(' ') });
  };

  const addTextBox = () => {
    const newText = {
      id: uuidv4(),
      text: 'Your Text Here',
      x: 50,
      y: 50,
      fontSize: 20,
      fill: '#000000',
      rotation: 0,
      fontFamily: 'Arial',
      draggable: true,
    };
    setTexts([...texts, newText]);
    setSelectedTextId(newText.id);
  };

  const updateText = (id: string | null, newAttrs: any) => {
    const updatedTexts = texts.map((text) => {
      if (text.id === id) {
        return { ...text, ...newAttrs };
      }
      return text;
    });
    setTexts(updatedTexts);
  };

  const handleSelectText = (id: string | null) => {
    setSelectedTextId(id);
  };

  const deleteText = (id: string) => {
    setTexts(texts.filter((text) => text.id !== id));
    setSelectedTextId(null);
  };

  const deleteLogo = () => {
    setLogo(null);
    setSelectedTextId(null);
  };

  const [image] = useImage(psdImage || '');
  const [logoImage] = useImage(logo || '');

  const isWithinBoundary = (x: number, y: number, width: number, height: number) => {
    return (
      x >= boundary.x &&
      y >= boundary.y &&
      x + width <= boundary.x + boundary.width &&
      y + height <= boundary.y + boundary.height
    );
  };

  const handleDragMove = (e: any, id: string | null) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();

    if (!isWithinBoundary(newX, newY, width, height)) {
      node.position({
        x: Math.min(Math.max(newX, boundary.x), boundary.x + boundary.width - width),
        y: Math.min(Math.max(newY, boundary.y), boundary.y + boundary.height - height)
      });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-100">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Upload PSD
        </button>
        <button
          onClick={addTextBox}
          className="mb-4 w-full px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Add Text Box
        </button>
        <input
          type="file"
          ref={logoInputRef}
          onChange={handleLogoChange}
          className="hidden"
        />
        <button
          onClick={() => logoInputRef.current?.click()}
          className="mb-4 w-full px-4 py-2 bg-purple-500 text-white rounded-md"
        >
          Add Logo
        </button>
        {selectedTextId && (
          <>
            <input
              type="text"
              value={texts.find((text) => text.id === selectedTextId)?.text || ''}
              onChange={(e) =>
                updateText(selectedTextId, { text: e.target.value })
              }
              className="mb-2 p-2 border rounded-md w-full"
            />
            <input
              type="number"
              value={texts.find((text) => text.id === selectedTextId)?.fontSize || 20}
              onChange={(e) =>
                updateText(selectedTextId, { fontSize: Number(e.target.value) })
              }
              className="mb-2 p-2 border rounded-md w-full"
            />
            <input
              type="color"
              value={texts.find((text) => text.id === selectedTextId)?.fill || '#000000'}
              onChange={(e) => updateText(selectedTextId, { fill: e.target.value })}
              className="mb-2 p-2 border rounded-md w-full"
            />
            <Select
              options={[
                { value: 'Arial', label: 'Arial' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Verdana', label: 'Verdana' },
                { value: 'Courier New', label: 'Courier New' },
              ]}
              onChange={handleFontChange}
              className="mb-2 w-full"
            />
            <button
              onClick={() => toggleTextStyle('bold')}
              className={`mb-2 w-full px-4 py-2 ${texts.find((text) => text.id === selectedTextId)?.fontStyle?.includes('bold') ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'} rounded-md`}
            >
              Bold
            </button>
            <button
              onClick={() => toggleTextStyle('italic')}
              className={`mb-2 w-full px-4 py-2 ${texts.find((text) => text.id === selectedTextId)?.fontStyle?.includes('italic') ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'} rounded-md`}
            >
              Italic
            </button>
            <button
              onClick={() => deleteText(selectedTextId)}
              className="mb-2 w-full px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete Text Box
            </button>
          </>
        )}
        {logo && (
          <>
            <button
              onClick={deleteLogo}
              className="mb-2 w-full px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete Logo
            </button>
          </>
        )}
      </div>
      <div className="w-3/4 flex items-center justify-center bg-gray-200">
        {psdImage && (
          <Stage width={800} height={600}>
            <Layer>
              <KonvaImage image={image} />
              <Rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.width}
                height={boundary.height}
                stroke="red"
                strokeWidth={2}
                dash={[4, 4]}
              />
              {texts.map((text) => (
                <React.Fragment key={text.id}>
                  <KonvaText
                    text={text.text}
                    x={text.x}
                    y={text.y}
                    fontSize={text.fontSize}
                    fill={text.fill}
                    rotation={text.rotation}
                    fontFamily={text.fontFamily}
                    draggable
                    onClick={() => handleSelectText(text.id)}
                    onDragMove={(e) => handleDragMove(e, text.id)}
                    ref={text.id === selectedTextId ? selectedTextRef : null}
                    fontStyle={text.fontStyle}
                  />
                  {text.id === selectedTextId && (
                    <Transformer ref={transformerRef} />
                  )}
                </React.Fragment>
              ))}
              {logo && (
                <React.Fragment>
                  <KonvaImage
                    image={logoImage}
                    x={100}
                    y={100}
                    width={100}
                    height={100}
                    draggable
                    ref={logoRef}
                    onClick={() => handleSelectText(null)}
                    onDragMove={(e) => handleDragMove(e, null)}
                  />
                  <Transformer
                    ref={logoTransformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) {
                        return oldBox;
                      }
                      if (!isWithinBoundary(newBox.x, newBox.y, newBox.width, newBox.height)) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </React.Fragment>
              )}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
};

export default PsdEditor;
