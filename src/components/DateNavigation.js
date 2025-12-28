'use client';

import { useState } from 'react';
import styles from './DateNavigation.module.css';

export default function DateNavigation({ selectedDate, onDateChange }) {
    const dates = [];
    const today = new Date();

    // Generate dates: -1 (yesterday) to +3 (3 days ahead)
    for (let i = -1; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            date: d.toISOString().split('T')[0],
            label: getDateLabel(d, i),
            dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
            dayNum: d.getDate()
        });
    }

    function getDateLabel(date, offset) {
        if (offset === -1) return 'Ontem';
        if (offset === 0) return 'Hoje';
        if (offset === 1) return 'Amanhã';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    return (
        <div className={styles.dateNavigation}>
            {dates.map((d) => (
                <button
                    key={d.date}
                    className={`${styles.dateBtn} ${selectedDate === d.date ? styles.active : ''}`}
                    onClick={() => onDateChange(d.date)}
                >
                    <span className={styles.dayName}>{d.dayName}</span>
                    <span className={styles.dayNum}>{d.dayNum}</span>
                    <span className={styles.label}>{d.label}</span>
                </button>
            ))}
        </div>
    );
}
