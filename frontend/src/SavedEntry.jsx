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
    const [stickers, setStickers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [target, setTarget] = useState(null);

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
                            setStickers(data.entry.stickers);
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

    useEffect(() => {
        if (isEditing && editableRef.current) {
            if (selectedId == null) {
                setTarget(null);
                return;
            }
            const el = editableRef.current?.querySelector(`[data-sticker-id="${selectedId}"]`);
            setTarget(el || null);
        }
    }, [isEditing, selectedId, stickers]);

    const addSticker = (src) => {
        const id = Date.now();
        setStickers(prev => [...prev, { id, src, x: 50, y: 50, width: 100, height: 100, rotate: 0, z: prev.length+1}]);
        setSelectedId(id);
    };

    const updateSticker = (id, patch) => {
        setStickers(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));
    };

    const saveStickers = async() => {
        try {
            const response = await fetch(backendUrl + '/api/journal/update-stickers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    date: date,
                    stickers: stickers.map(s => ({
                        id: s.id,
                        src: s.src,
                        x: s.x,
                        y: s.y,
                        width: s.width,
                        height: s.height,
                        rotate: s.rotate,
                        z: s.z
                    }))
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

    return (
        <div className='entire-screen' style={{backgroundColor: entry.emotionColor}}>
            <div className="editable-area" ref={editableRef}>
                <div className="journal-container">
                    <div className="entry-header">
                        <Link to="/calendar" className="back-button" style={{color: entry.emotionColor}}>← Back to Calendar</Link>
                        <h1>{entry.title}</h1>
                        <h2>{new Date(entry.date).toLocaleDateString()}</h2>
                    </div>
                    <div className="entry-content">
                        <p>Emotion: {entry.emotion}</p>
                        <div>{entry.content}</div>
                    </div>
                    <div>
                        {!isEditing ? 
                            <button onClick={() => setIsEditing(true)} className="back-button" style={{color: entry.emotionColor}}>Edit</button> :
                            <button onClick={async() => { await saveStickers(); setIsEditing(false); }} className="back-button" style={{color: entry.emotionColor}}>Done</button>
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
                    </div>
                    </>
                )}
                {/* render stickers */}
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
                    container={editableRef.current}
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
            </div>
        </div>
    );
};