import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from './context/AuthContext';
import Moveable from 'react-moveable';
import './SavedEntry.css'

export default function SavedEntry() {
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const { date } = useParams();
    const { backendUrl } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const editableRef = useRef(null);
    const journalContainerRef = useRef(null);
    const [stickers, setStickers] = useState([]);
    const [stickersPercent, setStickersPercent] = useState([]); // Store % for resize
    const [selectedId, setSelectedId] = useState(null);
    const [target, setTarget] = useState(null);

    // Conversion helpers
    const pxToPercent = (px, containerSize) => (px / containerSize) * 100;
    const percentToPx = (percent, containerSize) => (percent / 100) * containerSize;

    useEffect(() => {
        const fetchEntry = async() => {
            try {
                const response = await fetch(backendUrl + `/api/journal/get-entry-date?date=${date}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                
                console.log('API response:', data);
                
                if (data.success) {
                    if (data.entry) {
                        setEntry(data.entry);
                        // Load stickers from entry if they exist
                        if (data.entry.stickers && Array.isArray(data.entry.stickers)) {
                            setStickersPercent(data.entry.stickers);
                        }
                    } else {
                        console.log('No entry found for date:', date);
                    }
                } else {
                    console.error('Failed to fetch entry:', data.message);
                }
            } catch (error) {
                console.error("Fetch entry error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchEntry();
    }, [backendUrl, date]);

    // Convert stickers from percentages to pixels when stickersPercent changes or container is ready
    useEffect(() => {
        if (!journalContainerRef.current || stickersPercent.length === 0) return;
        
        const rect = journalContainerRef.current.getBoundingClientRect();
        const stickersInPx = stickersPercent.map(s => ({
            ...s,
            x: percentToPx(s.x, rect.width),
            y: percentToPx(s.y, rect.height),
            width: percentToPx(s.width, rect.width),
            height: percentToPx(s.height, rect.width)
        }));
        setStickers(stickersInPx);
    }, [stickersPercent, entry]);

    useEffect(() => {
        if (isEditing && journalContainerRef.current) {
            if (selectedId == null) {
                setTarget(null);
                return;
            }
            const el = journalContainerRef.current?.querySelector(`[data-sticker-id="${selectedId}"]`);
            setTarget(el || null);
        } else {
            setTarget(null);
        }
    }, [isEditing, selectedId, stickers]);

    useEffect(() => {
        const handleResize = () => {
            if (!journalContainerRef.current || stickersPercent.length === 0) return;
            const rect = journalContainerRef.current.getBoundingClientRect();
            const stickersInPx = stickersPercent.map(s => ({
                ...s,
                x: percentToPx(s.x, rect.width),
                y: percentToPx(s.y, rect.height),
                width: percentToPx(s.width, rect.width),
                height: percentToPx(s.height, rect.width)
            }));
            setStickers(stickersInPx);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [stickersPercent]);

    // Delete sticker on backspace key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' && selectedId !== null && isEditing) {
                e.preventDefault();
                setStickers(prev => prev.filter(s => s.id !== selectedId));
                setStickersPercent(prev => prev.filter(s => s.id !== selectedId));
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, isEditing]);

    const addSticker = (src) => {
        const id = Date.now();
        setStickers(prev => [...prev, { id, src, x: 50, y: 50, width: 100, height: 100, rotate: 0, z: prev.length+1}]);
        setSelectedId(id);
    };

    const updateSticker = (id, patch) => {
        setStickers(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));
    };

    const saveStickers = async() => {
        if (!journalContainerRef.current) return;
        const rect = journalContainerRef.current.getBoundingClientRect();
        
        // Convert pixels to percentages before saving
        const stickersAsPercent = stickers.map(s => ({
            id: s.id,
            src: s.src,
            x: pxToPercent(s.x, rect.width),
            y: pxToPercent(s.y, rect.height),
            width: pxToPercent(s.width, rect.width),
            height: pxToPercent(s.height, rect.width), // use width for aspect ratio
            rotate: s.rotate,
            z: s.z
        }));
        
        setStickersPercent(stickersAsPercent);
        
        try {
            const response = await fetch(backendUrl + '/api/journal/update-stickers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    date: date,
                    stickers: stickersAsPercent
                })
            });
            const data = await response.json();
            if (data.success) {
                console.log('Stickers saved successfully');
            } else {
                console.error('Failed to save stickers:', data.message);
            }
        } catch (error) {
            console.error('Error saving stickers:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!entry) {
        return (
            <div>
                <h1>No entry found for {date}</h1>
                <Link to="/calendar">Back to Calendar</Link>
            </div>
        );
    }

    // Determine readable text color based on entry background
    const entryBg = entry.emotionColor || '#ffffff';
    const normalizedBg = String(entryBg).toLowerCase().trim();
    const isWhiteBg = normalizedBg === '#ffffff' || normalizedBg === '#fff' || normalizedBg === 'white';
    const textColor = isWhiteBg ? '#000000' : entry.emotionColor;

    return (
        <div className='entire-screen' style={{backgroundColor: entryBg, color: textColor}}>
            <div className={`editable-area ${isEditing ? 'editing' : ''}`} ref={editableRef}>
                <div className="journal-container" ref={journalContainerRef} style={{position: 'relative'}}>
                    <div className="entry-header">
                        <Link to="/calendar" className="back-button" style={{color: textColor}}>← Back to Calendar</Link>
                        <h1 style={{color: 'black'}}>{entry.title}</h1>
                        <h2 style={{color: 'black'}}>{new Date(entry.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</h2>
                    </div>
                    <div className="entry-content" style={{color: 'black'}}>
                        <p>Emotion: {entry.emotion}</p>
                        <div>{entry.content}</div>
                    </div>

                    {/* render stickers inside journal-container */}
                    {stickers.map(s => (
                        <img
                        key={s.id}
                        data-sticker-id={s.id}
                        src={s.src}
                        alt="sticker"
                        onMouseDown={() => setSelectedId(s.id)}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: s.width + 'px',
                            height: s.height + 'px',
                            transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
                            transformOrigin: '0 0',
                            cursor: selectedId === s.id ? 'grabbing' : 'grab',
                            zIndex: s.z,
                            userSelect: 'none'
                        }}
                        draggable={false}
                        />
                    ))}
                    <Moveable
                        target={target}
                        container={journalContainerRef.current}
                        origin={false}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        throttleDrag={0}
                        throttleResize={0}
                        edge={false}
                        keepRatio={false}
                        bounds={{left: 0, top: 0, right: 0, bottom: 0, position: 'css'}}
                        onDragStart={({set}) => { 
                            const sticker = stickers.find(s => s.id === selectedId);
                            if (sticker) set([sticker.x, sticker.y]); 
                        }}
                        onDrag={({target, beforeTranslate}) => {
                            const id = Number(target.getAttribute('data-sticker-id'));
                            updateSticker(id, { x: beforeTranslate[0], y: beforeTranslate[1] });
                            target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px) rotate(${stickers.find(s => s.id === id)?.rotate || 0}deg)`;
                        }}
                        onResize={({target, width, height, drag}) => {
                            const id = Number(target.getAttribute('data-sticker-id'));
                            const sticker = stickers.find(s => s.id === id);
                            updateSticker(id, { width, height, x: drag.beforeTranslate[0], y: drag.beforeTranslate[1] });
                            target.style.width = `${width}px`;
                            target.style.height = `${height}px`;
                            target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${sticker?.rotate || 0}deg)`;
                        }}
                        onRotate={({target, beforeRotate}) => {
                            const id = Number(target.getAttribute('data-sticker-id'));
                            const sticker = stickers.find(s => s.id === id);
                            updateSticker(id, { rotate: beforeRotate });
                            target.style.transform = `translate(${sticker?.x || 0}px, ${sticker?.y || 0}px) rotate(${beforeRotate}deg)`;
                        }}
                        onClick={({target, inputEvent}) => {
                        // clicking the moveable itself selects (optional)
                        const id = Number(target.getAttribute('data-sticker-id'));
                        setSelectedId(id);
                        }}
                    />
                    
                    <div>
                        {!isEditing ? 
                            <button onClick={() => setIsEditing(true)} className="edit-button" style={{color: textColor}}>Edit</button> :
                            <button onClick={async() => { await saveStickers(); setIsEditing(false); }} className="edit-button" style={{color: textColor}}>Done</button>
                        }
                    </div>
                </div>
                {isEditing && (
                    <>
                    {/* sticker thumbnails / picker */}
                    <div style={{position: 'absolute', left: 8, top: 8, zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <img src="/tried.png" width={48} onClick={() => addSticker('/tried.png')} style={{cursor: 'pointer'}} />
                        <img src="/angry.webp" width={48} onClick={() => addSticker('/angry.webp')} style={{cursor: 'pointer'}} />
                        <img src="/watermelon.webp" width={48} onClick={() => addSticker('/watermelon.webp')} style={{cursor: 'pointer'}} />
                        <img src="/3-7.png" width={48} onClick={() => addSticker('/3-7.png')} style={{cursor: 'pointer'}} />
                        <img src="/seele-yawn.webp" width={48} onClick={() => addSticker('/seele-yawn.webp')} style={{cursor: 'pointer'}} />
                        <img src="/guinaifen.png" width={48} onClick={() => addSticker('/guinaifen.png')} style={{cursor: 'pointer'}} />
                        <img src="/trash.png" width={48} onClick={() => addSticker('/trash.png')} style={{cursor: 'pointer'}} />
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};