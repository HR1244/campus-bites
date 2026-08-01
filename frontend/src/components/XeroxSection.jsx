import React, { useState, useRef } from 'react';

export default function XeroxSection({ onAddCustomItem }) {
  const [printType, setPrintType] = useState('bw');
  const [doubleSided, setDoubleSided] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [pages, setPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  const getPageRate = () => {
    let rate = 0;
    if (printType === 'bw') {
      rate = doubleSided ? 2.0 : 3.0;
    } else {
      rate = doubleSided ? 8.5 : 10.0;
    }
    if (paperSize === 'A3') {
      rate += 2.0;
    }
    return rate;
  };

  const pageRate = getPageRate();
  const unitPrice = pages * pageRate;
  const totalPrice = unitPrice * copies;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setFileData(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setFileData(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddClick = () => {
    const finalFileName = fileName || 'document.pdf';
    
    const printDesc = `${printType === 'bw' ? 'B&W' : 'Colour'} Print (${paperSize}, ${doubleSided ? 'Double-Sided' : 'Single-Sided'}, ${pages} pages)`;
    
    const customItem = {
      id: `xerox_${printType}_${Date.now()}`,
      name: `Xerox: ${finalFileName}`,
      img: '', 
      price: unitPrice,
      qty: copies,
      description: printDesc,
      isXerox: true,
      xeroxDetails: {
        fileName: finalFileName,
        fileData: fileData,
        printType,
        doubleSided,
        paperSize,
        pages,
        copies
      }
    };

    onAddCustomItem(customItem);
    
    setFileName('');
    setFileData(null);
    setPages(1);
    setCopies(1);
  };

  return (
    <section className="xerox-section" id="xerox">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Xerox Services</span>
          <h2 className="section-title">Print &amp; Copy Services</h2>
          <p className="section-sub">Quick, affordable printing right inside the campus!</p>
        </div>
        
        <div className="xerox-grid">
          {}
          <div className="xerox-card reveal" id="xeroxBW" onClick={() => setPrintType('bw')}>
            <div className="xerox-img-wrap bw-img-wrap">
              <div className="xerox-print-visual bw">
                <div className="print-paper">
                  <div className="print-line"></div><div className="print-line"></div>
                  <div className="print-line short"></div><div className="print-line"></div>
                  <div className="print-line short"></div><div className="print-line"></div>
                </div>
              </div>
            </div>
            <div className="xerox-badge bw-badge">Popular</div>
            <h3>Black &amp; White Copy</h3>
            <p>High-quality B&amp;W prints for notes, assignments &amp; handouts</p>
            <ul className="xerox-features">
              <li>A4 Size</li>
              <li>Both Sides Available</li>
              <li>Bulk Discount</li>
              <li>PDF File Available</li>
            </ul>
            <div className="xerox-price">
              <span className="price-label">Starting from</span>
              <span className="price-val">₹3<small>/page</small></span>
            </div>
          </div>

          {}
          <div className="xerox-card featured reveal" id="xeroxColor" onClick={() => setPrintType('color')}>
            <div className="xerox-img-wrap color-img-wrap">
              <div className="xerox-print-visual color-visual">
                <div className="print-paper color-paper">
                  <div className="print-bar red"></div>
                  <div className="print-bar blue"></div>
                  <div className="print-bar green"></div>
                  <div className="print-bar orange"></div>
                </div>
              </div>
            </div>
            <div className="xerox-badge color-badge">Premium</div>
            <h3>Colourful Copy</h3>
            <p>Vivid, vibrant color prints for presentations, posters &amp; projects</p>
            <ul className="xerox-features">
              <li>A4 &amp; A3 Size</li>
              <li>Photo Quality</li>
              <li>Both Sides Available</li>
              <li>Glossy &amp; Matte</li>
            </ul>
            <div className="xerox-price">
              <span className="price-label">Starting from</span>
              <span className="price-val">₹10<small>/page</small></span>
            </div>
          </div>
        </div>

        {}
        <div className="xerox-interactive-form reveal">
          <h3 style={{ fontSize: '18px', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
            Configure Print Job
          </h3>
          
          <div className="x-form-row">
            <div className="x-form-group">
              <label>Print Type</label>
              <select className="x-select" value={printType} onChange={e => setPrintType(e.target.value)}>
                <option value="bw">Black &amp; White (₹3/pg)</option>
                <option value="color">Full Colour (₹10/pg)</option>
              </select>
            </div>
            
            <div className="x-form-group">
              <label>Paper Size</label>
              <select className="x-select" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                <option value="A4">A4 Standard</option>
                <option value="A3">A3 Large (+₹2/pg)</option>
              </select>
            </div>
          </div>

          <div className="x-form-group">
            <label>Upload Document</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <div 
              className="x-file-uploader" 
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="x-file-icon">📄</div>
              {fileName ? (
                <div>
                  <span className="x-file-name">{fileName}</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', marginLeft: '10px', fontSize: '12px', fontWeight: 700 }}
                    onClick={(e) => { e.stopPropagation(); setFileName(''); }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <span className="x-file-name" style={{ color: 'var(--text-muted)' }}>Drag &amp; drop document or click to browse</span>
                  <div className="x-file-desc">Supports PDF, Word, or Image files</div>
                </div>
              )}
            </div>
          </div>

          <div className="x-switch-row">
            <span>Double-Sided Printing (Save Paper!)</span>
            <label className="switch-control">
              <input 
                type="checkbox" 
                checked={doubleSided} 
                onChange={e => setDoubleSided(e.target.checked)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className="x-form-row">
            <div className="x-form-group">
              <label>Total Pages</label>
              <input 
                type="number" 
                className="x-input" 
                min="1" 
                value={pages} 
                onChange={e => setPages(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div className="x-form-group">
              <label>Copies</label>
              <input 
                type="number" 
                className="x-input" 
                min="1" 
                value={copies} 
                onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="x-cost-summary">
            <span className="x-cost-label">
              Rate: ₹{pageRate.toFixed(2)}/pg · Cost: {pages} pg × {copies} {copies === 1 ? 'copy' : 'copies'}
            </span>
            <span className="x-cost-value">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-add-xerox"
            onClick={handleAddClick}
          >
            Add Print Job to Cart
          </button>
        </div>

      </div>
    </section>
  );
}
