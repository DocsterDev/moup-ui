import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {YoutubeAutoCompleteService} from './youtube-auto-complete.service';

@Injectable()
export class YoutubeSearchService {
  constructor(private youTubeQueryService: YoutubeAutoCompleteService) {
  }

  private resultList = new Subject<any>();

  /**
   * Search via passed in query
   */
  search(query: string) {
    this.youTubeQueryService.getSearchResults(query).subscribe((response) => {
      this.resultList.next(response);
    }, (error) => {
      console.log(error);
    });
  }

  clearResultList () {
    this.resultList.next();
  }

  getResultList (): Observable<any> {
    return this.resultList.asObservable();
  }

}