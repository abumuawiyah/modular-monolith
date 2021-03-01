import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import {
  map, distinctUntilChanged
} from 'rxjs/operators';

export interface AssetState {
    state1: string | null;
    state2: {
      item1: string | null;
      item2: string | null;
    };
}

let _state: AssetState = {
  state1: null,
  state2: {
      item1: null,
      item2: null
  }
};


@Injectable()
export class AssetFacade {

  private store  = new BehaviorSubject<AssetState>(_state);
  private state$ = this.store.asObservable();

  state1$ = this.state$.pipe(map(state => state.state1), distinctUntilChanged());
  state2$ = this.state$.pipe(map(state => state.state2), distinctUntilChanged());

  /**
   * Viewmodel that resolves once all the data is ready (or updated)...
   */
  vm$: Observable<AssetState> = combineLatest([this.state1$, this.state2$]).pipe(
    map( ([state1, state2]) => {
      return { state1, state2 };
    })
  );

  /**
   * Watch 2 streams to trigger user loads and state updates
   */
  constructor(private http: HttpClient) {
    this.state1$.subscribe(() => {
        this.getAsset().subscribe((res: any) => {
            this.updateState({ ..._state, state2: res });
        });
    });
  }

  // ------- Public Methods ------------------------

  // Allows quick snapshot access to data for ngOnInit() purposes
  getStateSnapshot(): AssetState {
    return {..._state};
  }

  updateState2(data: any): void {
    this.updateState({ ..._state, state2: data });
  }

  // ------- Private Methods ------------------------

  /** Update internal state cache and emit from store... */
  private updateState(state: AssetState): void {
    this.store.next(_state = state);
  }

  /** REST call */
  private getAsset(url = ''): Observable<any[]> {
    return this.http.get<any>(url).pipe(
      map(response => response.results)
    );
  }

}
