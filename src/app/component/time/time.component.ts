import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessDashboardService } from '../../Shared/Services/mess-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export interface HolidaySelection {
  name: string;
  from: string;
  to: string;
}

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrl: './time.component.css'
})
export class TimeComponent implements OnInit, AfterViewInit {

  myTimeForm!: FormGroup;
  myTimeDetails: any[] = [];
  drumReady = false;

  // Holiday modal state
  isHolidayModalOpen = false;
  pendingHoliday: string | null = null;
  holidayFromDate = '';
  holidayToDate = '';
  dateError = false;
  selectedHolidays: HolidaySelection[] = [];

  holidayList: string[] = [
    "New Year's Day",
    "Republic Day",
    "Holi",
    "Good Friday",
    "Independence Day",
    "Gandhi Jayanti",
    "Diwali",
    "Christmas Day",
    "Weekend"
  ];

  // Drum picker IDs for morning & evening
  private drumIds = ['mf-h','mf-m','mf-a','mt-h','mt-m','mt-a','ef-h','ef-m','ef-a','et-h','et-m','et-a'];

  constructor(
    private router: Router,
    private messDetailsServ: MessDashboardService,
    private fb: FormBuilder,
    private toastrServ: ToastrService
  ) {}

  ngOnInit(): void {
    this.initialTimeForm();
    this.getTimeDetails();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initDrums(), 100);
  }

  initialTimeForm() {
    this.myTimeForm = this.fb.group({
      timeDetails: this.fb.group({
        userId: localStorage.getItem('userId'),
        morning: this.fb.group({
          from: this.fb.control('', Validators.required),
          to: this.fb.control('', Validators.required),
        }),
        evening: this.fb.group({
          from: this.fb.control('', Validators.required),
          to: this.fb.control('', Validators.required),
        }),
        holiday: this.fb.group({
          period: this.fb.control('full day', Validators.required),
        }),
      }),
    });
  }

  // ── Drum Picker ──────────────────────────────────────────

  private initDrums(): void {
    const IH = 56, PAD = 1;

    const buildItems = (type: string): string[] => {
      if (type === 'hour')   return Array.from({length:12}, (_,i) => String(i+1).padStart(2,'0'));
      if (type === 'minute') return Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));
      return ['AM', 'PM'];
    };

    const setIdx = (el: any, idx: number, anim: boolean) => {
      const its = el._its;
      idx = ((idx % its.length) + its.length) % its.length;
      el._idx = idx;
      const off = -(idx * IH) + (56/2 - IH/2);
      el._inner.style.transition = anim ? 'transform .18s cubic-bezier(.25,.8,.25,1)' : 'none';
      el._inner.style.transform = `translateY(${off}px)`;
      el._inner.querySelectorAll('.drum-item').forEach((d: any, i: number) => {
        const real = i - PAD, dist = Math.abs(real - idx);
        d.style.fontWeight  = real === idx ? '600' : '400';
        d.style.fontSize    = real === idx ? '16px' : '13px';
        d.style.color       = real === idx ? 'var(--color-text-primary, #000)' : '#888';
        d.style.opacity     = real === idx ? '1' : String(Math.max(0.2, 1 - dist * 0.4));
      });
      // sync form control
      this.syncFormFromDrums();
    };

    const addDrag = (el: any) => {
      let sY = 0, sI = 0, dn = false;
      const s = (e: any) => { dn=true; sY=e.touches?e.touches[0].clientY:e.clientY; sI=el._idx; el._inner.style.transition='none'; e.preventDefault(); };
      const m = (e: any) => { if(!dn) return; const y=e.touches?e.touches[0].clientY:e.clientY; setIdx(el, sI+Math.round((sY-y)/IH), false); e.preventDefault(); };
      const u = () => { if(!dn) return; dn=false; setIdx(el,el._idx,true); };
      el.addEventListener('mousedown', s);
      el.addEventListener('touchstart', s, {passive:false});
      window.addEventListener('mousemove', m);
      window.addEventListener('touchmove', m, {passive:false});
      window.addEventListener('mouseup', u);
      window.addEventListener('touchend', u);
      el.addEventListener('wheel', (e: any) => { e.preventDefault(); setIdx(el, el._idx+(e.deltaY>0?1:-1), true); }, {passive:false});
    };

    this.drumIds.forEach(id => {
      const el: any = document.getElementById(id);
      if (!el || el._its) return;
      const type = el.dataset['type'];
      const its = buildItems(type);
      const inner = document.createElement('div');
      inner.className = 'drum-inner';
      el._its = its; el._idx = type==='ampm'?0:type==='hour'?5:0; el._inner = inner;
      for(let i=0;i<PAD;i++){const g=document.createElement('div');g.className='drum-item';g.style.opacity='.25';g.textContent=its[(its.length-PAD+i)%its.length];inner.appendChild(g);}
      its.forEach((v:string)=>{const d=document.createElement('div');d.className='drum-item';d.textContent=v;inner.appendChild(d);});
      for(let i=0;i<PAD;i++){const g=document.createElement('div');g.className='drum-item';g.style.opacity='.25';g.textContent=its[i%its.length];inner.appendChild(g);}
      el.appendChild(inner);
      setIdx(el, el._idx, false);
      addDrag(el);
    });
  }

  private getDrumValue(id: string): string {
    const el: any = document.getElementById(id);
    return el?._its?.[el._idx] ?? '';
  }

  private syncFormFromDrums(): void {
    const pad = (v:string) => v;
    const toTime = (h:string, m:string, a:string) => `${h}:${m} ${a}`;
    this.myTimeForm.get('timeDetails.morning.from')?.setValue(toTime(this.getDrumValue('mf-h'), this.getDrumValue('mf-m'), this.getDrumValue('mf-a')), {emitEvent:false});
    this.myTimeForm.get('timeDetails.morning.to')?.setValue(toTime(this.getDrumValue('mt-h'), this.getDrumValue('mt-m'), this.getDrumValue('mt-a')), {emitEvent:false});
    this.myTimeForm.get('timeDetails.evening.from')?.setValue(toTime(this.getDrumValue('ef-h'), this.getDrumValue('ef-m'), this.getDrumValue('ef-a')), {emitEvent:false});
    this.myTimeForm.get('timeDetails.evening.to')?.setValue(toTime(this.getDrumValue('et-h'), this.getDrumValue('et-m'), this.getDrumValue('et-a')), {emitEvent:false});
  }

  /** Set drum to a given index by value */
  private setDrumByValue(id: string, value: string): void {
    const el: any = document.getElementById(id);
    if (!el?._its) return;
    const idx = el._its.indexOf(value);
    if (idx >= 0) {
      el._idx = idx;
      const off = -(idx * 56) + (56/2 - 56/2);
      el._inner.style.transition = 'none';
      el._inner.style.transform = `translateY(${off}px)`;
    }
  }

  // ── API ──────────────────────────────────────────────────

  getTimeDetails() {
    this.messDetailsServ.getTimeDetailsList().subscribe({
      next: (_timeDetails: any) => {
        console.log(_timeDetails);
        this.myTimeDetails.push(_timeDetails.data);
        this.mySetTimeDetails();
      },
      error: (_error: any) => console.log(_error)
    });
  }

  mySetTimeDetails() {
    this.myTimeDetails.forEach((timeDetails: any) => {
      // Restore drums from saved time strings e.g. "11:00 AM"
      this.restoreDrum('mf', timeDetails.morning?.from);
      this.restoreDrum('mt', timeDetails.morning?.to);
      this.restoreDrum('ef', timeDetails.evening?.from);
      this.restoreDrum('et', timeDetails.evening?.to);

      this.myTimeForm.get('timeDetails.holiday.period')?.setValue(timeDetails.holiday?.period);

      if (timeDetails.holiday?.holidays && Array.isArray(timeDetails.holiday.holidays)) {
        this.selectedHolidays = timeDetails.holiday.holidays;
      }
    });
  }

  /** Parse "11:00 AM" and set the three drum wheels */
  private restoreDrum(prefix: string, timeStr: string): void {
    if (!timeStr) return;
    setTimeout(() => {
      const parts = timeStr.split(':');          // ["11", "00 AM"]
      const h = parts[0]?.padStart(2,'0');
      const rest = parts[1]?.split(' ');         // ["00", "AM"]
      const m = rest?.[0]?.padStart(2,'0');
      const a = rest?.[1];
      if (h) this.setDrumByValue(`${prefix}-h`, h);
      if (m) this.setDrumByValue(`${prefix}-m`, m);
      if (a) this.setDrumByValue(`${prefix}-a`, a);
      this.syncFormFromDrums();
    }, 150);
  }

  onTimeDataSubmit() {
    this.syncFormFromDrums();
    const payload = {
      ...this.myTimeForm.value,
      timeDetails: {
        ...this.myTimeForm.value.timeDetails,
        holiday: {
          ...this.myTimeForm.value.timeDetails.holiday,
          holidays: this.selectedHolidays
        }
      }
    };
    console.log(payload);
    this.messDetailsServ.patchTimeDetailsList(payload).subscribe({
      next: (_timeDetails: any) => {
        this.toastrServ.success('Updated successfully');
        console.log(_timeDetails);
      },
      error: (_error: any) => {
        this.toastrServ.error('Error in updating');
        console.log(_error);
      }
    });
  }

  // ── Holiday Modal ─────────────────────────────────────────

  openHolidayModal(): void {
    this.pendingHoliday = null;
    this.holidayFromDate = '';
    this.holidayToDate = '';
    this.dateError = false;
    this.isHolidayModalOpen = true;
  }

  closeHolidayModal(): void {
    this.isHolidayModalOpen = false;
    this.pendingHoliday = null;
    this.dateError = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('holiday-modal-overlay')) {
      this.closeHolidayModal();
    }
  }

  selectPendingHoliday(name: string): void {
    this.pendingHoliday = this.pendingHoliday === name ? null : name;
  }

  confirmHoliday(): void {
    if (!this.pendingHoliday || !this.holidayFromDate || !this.holidayToDate) {
      this.dateError = true;
      return;
    }
    const existing = this.selectedHolidays.findIndex(h => h.name === this.pendingHoliday);
    const entry = { name: this.pendingHoliday, from: this.holidayFromDate, to: this.holidayToDate };
    if (existing > -1) {
      this.selectedHolidays[existing] = entry;
    } else {
      this.selectedHolidays.push(entry);
    }
    this.closeHolidayModal();
  }

  removeHoliday(name: string): void {
    this.selectedHolidays = this.selectedHolidays.filter(h => h.name !== name);
  }

  onLogoutButton() {
    this.router.navigate(['login']);
  }
}