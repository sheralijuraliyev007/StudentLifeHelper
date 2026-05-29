import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqlPanelService } from '../../services/SqlPanelService';
import { SqlQueryEntry } from '../../contracts';

@Component({
  selector: 'app-sql-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-panel.component.html',
  styleUrls: ['./sql-panel.component.scss']
})
export class SqlPanelComponent implements OnInit {
  @ViewChild('panel') panelRef!: ElementRef<HTMLDivElement>;

  queries: SqlQueryEntry[] = [];
  isExpanded = true;
  expandedIndex: number | null = null;
  panelHeight = 320;
  isResizing = false;

  constructor(private sqlPanel: SqlPanelService, private ngZone: NgZone) {}

  ngOnInit() {
    this.sqlPanel.queries$.subscribe(queries => {
      this.queries = queries;
      this.isExpanded = queries.length > 0;
      this.expandedIndex = null;
    });
  }

  togglePanel() {
  this.isExpanded = !this.isExpanded;
  if (this.isExpanded) {
    this.sqlPanel.flushSilent();
  }
}

  toggleQuery(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

onResizeStart(event: MouseEvent): void {
  event.preventDefault();
  this.isResizing = true;
  const startY = event.clientY;
  const startHeight = this.panelHeight;

  this.ngZone.runOutsideAngular(() => {
    const panelBody = document.querySelector('.panel-body') as HTMLElement;

    const onMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const newHeight = Math.min(600, Math.max(80, startHeight + delta));
      if (panelBody) {
        panelBody.style.height = `${newHeight}px`;
      }
    };

    const onUp = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      this.ngZone.run(() => {
        this.panelHeight = Math.min(600, Math.max(80, startHeight + delta));
        this.isResizing = false;
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

  formatDuration(duration: string): string {
    const parts = duration.split(':');
    const seconds = parseFloat(parts[2]);
    return `${(seconds * 1000).toFixed(2)}ms`;
  }

  getTotalDuration(): string {
    const total = this.queries.reduce((sum, q) => {
      const parts = q.duration.split(':');
      return sum + parseFloat(parts[2]);
    }, 0);
    return `${(total * 1000).toFixed(2)}ms total`;
  }

  highlightSql(sql: string): string {
    return sql
      .replace(/\b(SELECT|FROM|WHERE|INNER JOIN|LEFT JOIN|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|UPDATE|SET|INSERT|INTO|VALUES|DELETE|AND|OR|ON|AS|NOT|IN|IS|NULL|COUNT|CASE|WHEN|THEN|ELSE|END|COALESCE|DISTINCT|RETURNING)\b/gi,
        '<span class="kw">$1</span>')
      .replace(/(@\w+)/g, '<span class="param">$1</span>')
      .replace(/\b(FROM|JOIN)\s+(\S+)/gi, (_, kw, tbl) =>
        `<span class="kw">${kw}</span> <span class="tbl">${tbl}</span>`);
  }

  getPreview(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim().slice(0, 80) + '...';
  }

  clear() {
    this.sqlPanel.clear();
    this.isExpanded = false;
  }
}