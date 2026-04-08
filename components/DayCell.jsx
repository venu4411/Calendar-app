// components/DayCell.jsx
import { useState } from 'react';

export default function DayCell({
  year, month, day,
  isOtherMonth,
  isToday,
  isStart,
  isEnd,
  inRange,
  notes = [],
  onClick,
  onDoubleClick,
}) {
  const [showTip, setShowTip] = useState(false);
  const hasNotes = notes.length > 0;

  let cls = 'day-cell';
  if (isOtherMonth) cls += ' other-month';
  if (isToday)      cls += ' is-today';
  if (isStart)      cls += ' range-start';
  if (isEnd)        cls += ' range-end';
  if (inRange)      cls += ' in-range';

  return (
    <div
      className={cls}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => hasNotes && setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <span className="day-num">{day}</span>

      {hasNotes && <div className="note-dot" />}

      {showTip && (
        <div className="note-tooltip">
          {notes[0]}
          {notes.length > 1 && ` +${notes.length - 1} more`}
        </div>
      )}
    </div>
  );
}
