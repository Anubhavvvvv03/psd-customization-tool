"use client";

// components/PsdEditor.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import { readPsd } from 'ag-psd';
import useImage from 'use-image';
import Select from 'react-select';

const PsdEditor: React.FC = () => {
  const [psdImage, setPsdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('Your Text Here');
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#000000');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [logo, setLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

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
    if (transformerRef.current) {
      transformerRef.current.nodes([logoRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [logo]);

  const handleRotationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRotationAngle(Number(event.target.value));
  };

  const handleFontChange = (selectedOption: any) => {
    setFontFamily(selectedOption.value);
  };

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Lucida Console', label: 'Lucida Console' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Arial Black', label: 'Arial Black' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Book Antiqua', label: 'Book Antiqua' },
    { value: 'Century Gothic', label: 'Century Gothic' },
    { value: 'Franklin Gothic Medium', label: 'Franklin Gothic Medium' },
    { value: 'Rockwell', label: 'Rockwell' },
    { value: 'Baskerville', label: 'Baskerville' },
    { value: 'Cambria', label: 'Cambria' },
    { value: 'Copperplate', label: 'Copperplate' },
    { value: 'Futura', label: 'Futura' },
    { value: 'Didot', label: 'Didot' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Roboto', label: 'Roboto' },
  ];

  const [image] = useImage(psdImage || '');
  const [logoImage] = useImage(logo || '');

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>Upload PSD</button>
      {psdImage && (
        <Stage width={800} height={600}>
          <Layer>
            <KonvaImage image={image} />
            <KonvaText
              text={text}
              x={50}
              y={50}
              fontSize={fontSize}
              draggable
              fill={textColor}
              rotation={rotationAngle}
              fontFamily={fontFamily}
            />
            {logo && (
              <React.Fragment>
                <KonvaImage
                  image={logoImage}
                  x={100}
                  y={100}
                  draggable
                  width={100}
                  height={100}
                  ref={logoRef}
                />
                <Transformer ref={transformerRef} />
              </React.Fragment>
            )}
          </Layer>
        </Stage>
      )}
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
        <label>Rotation:</label>
        <input
          type="number"
          value={rotationAngle}
          onChange={handleRotationChange}
        />
        degrees
        <Select
          options={fontOptions}
          defaultValue={fontOptions[0]}
          onChange={handleFontChange}
        />
        <input
          type="file"
          ref={logoInputRef}
          onChange={handleLogoChange}
          style={{ display: 'none' }}
        />
        <button onClick={() => logoInputRef.current?.click()}>Add Logo</button>
      </div>
    </div>
  );
};

export default PsdEditor;
