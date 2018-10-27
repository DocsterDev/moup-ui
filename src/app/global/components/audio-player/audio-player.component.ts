import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {AudioPlayerService} from './audio-player.service';
import {Howl} from 'howler';
import {NotificationService} from '../notification/notification.service';
import {VideoRecommendedService} from '../../../service/video-recommended.service';
import {UtilsService} from '../../../service/utils.service';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';
import {environment} from '../../../../environments/environment';
import {HeaderService} from '../../../service/header.service';
import {EventBusService} from '../../../service/event-bus.service';
import {StreamPrefetchService} from '../../../service/stream-prefetch.service';
import {VideoSearchService} from '../../../service/video-search.service';



@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.sass']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  public showNowPlayingBar: boolean;
  public video: any = {};
  public progress;
  public duration: string;
  public elapsed: string;
  public seekTimer: string;
  private seek: number;

  private activeSound: Howl;

  public isLoading = false;
  public isPlaying = false;
  private videoServiceLock = false;

  private hasPrefetched: boolean;

  private currentPlaylist: any = [];
  private currentPlaylistIndex: number;
  private playlistIndex: number;

  private retryCount = 0;

  private isMobile: boolean;
  private isSearchModeEnabled: boolean;
  private savedShowNowPlayingBar: any;

  public seekBarHandlePosX: number;
  public seekBarHandleEnabled: boolean;

  private videoEventSubscription: Subscription;
  private videoPlayingEventSubscription: Subscription;
  private videoLoadingEventSubscription: Subscription;
  private playlistUpdateEventSubscription: Subscription;
  private streamValidatorSubscription: Subscription;
  private eventBusSubscription: Subscription;
  private playlistActionSubscription: Subscription;
  private streamPrefetchSubscription: Subscription;
  private streamRecPrefetchSubscription: Subscription;
  private upNextVideoEventSubscription: Subscription;

  private fetchedStreamUrl: any;
  private isChrome: boolean;
  private videoCount = 0;
  public upNextList = [];

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === ' ') {
      if (!this.isSearchModeEnabled) {
        this.toggle();
        event.preventDefault();
      }
    }
  }

  constructor(private audioPlayerService: AudioPlayerService,
              private notificationService: NotificationService,
              private videoRecommendedService: VideoRecommendedService,
              private videoSearchService: VideoSearchService,
              private titleService: Title,
              private headerService: HeaderService,
              private eventBusService: EventBusService,
              private streamPrefetchService: StreamPrefetchService) {
  }

  ngOnInit() {
    const userAgent = navigator.userAgent;
    console.log(userAgent);
    if (userAgent.indexOf('Chrome') !== -1) {
      this.isChrome = true;
    }
    Howl.autoSuspend = false;
    this.progress = '0';
    this.videoEventSubscription = this.audioPlayerService.triggerVideoEventEmitter$.subscribe((e) => {
      this.currentPlaylist = e.playlist;
      this.currentPlaylistIndex = e.index;
      this.playMedia(this.currentPlaylist[this.currentPlaylistIndex]);
    });
    this.playlistActionSubscription = this.audioPlayerService.triggerPlaylistActionEventEmitter$.subscribe((e) => {
      switch (e.action) {
        case 'prev':
          this.goToPrevious();
          break;
        case 'next':
          //this.goToNext();
          this.goToUpNextVideo();
          break;
      }
    });
    this.videoPlayingEventSubscription = this.audioPlayerService.triggerTogglePlayingEmitter$.subscribe((e) => {
      this.isPlaying = e.toggle;
    });
    this.videoLoadingEventSubscription = this.audioPlayerService.triggerToggleLoadingEmitter$.subscribe((e) => {
      this.isLoading = e.toggle;
    });
    this.playlistUpdateEventSubscription = this.audioPlayerService.triggerPlaylistUpdateEventEmitter$.subscribe((e) => {
      this.currentPlaylist = e.playlist;
      this.checkCurrentPlaylist();
    });
    this.isMobile = this.eventBusService.isDeviceMobile();
    this.eventBusSubscription = this.eventBusService.deviceListenerEvent$.subscribe((isMobile) => this.isMobile = isMobile);
    this.eventBusSubscription = this.eventBusService.searchModeEvent$.subscribe((isSearchModeEnabled) => {
      this.isSearchModeEnabled = isSearchModeEnabled;
      if (this.isMobile) {
        if (this.isSearchModeEnabled) {
          this.savedShowNowPlayingBar = this.showNowPlayingBar;
          this.showNowPlayingBar = false;
        } else {
          this.showNowPlayingBar = this.savedShowNowPlayingBar;
        }
      }
    });
    this.eventBusSubscription = this.eventBusService.scrollEvent$.subscribe((isScrolling) => {
      if (isScrolling) {
      }
    });
    this.upNextVideoEventSubscription = this.audioPlayerService.triggerUpNextVideoEmitter$.subscribe((upNextList) => {
      this.upNextList = upNextList;
    });
  }

  private goToUpNextVideo() {
    this.audioPlayerService.triggerVideoEvent({index: 0, playlist: this.upNextList});
  }

  private goToNext() {
    if (this.currentPlaylist.length === (this.currentPlaylistIndex + 1)) {
      console.log('Last video in the playlist cannot continue');
      this.audioPlayerService.triggerTogglePlaying({toggle: false});
      return;
    }
    this.currentPlaylistIndex++;
    this.audioPlayerService.triggerVideoEvent({index: this.currentPlaylistIndex, playlist: this.currentPlaylist});
  }

  private goToPrevious() {
    if (this.currentPlaylistIndex === 0) {
      this.audioPlayerService.triggerVideoEvent({index: this.currentPlaylistIndex, playlist: this.currentPlaylist});
      console.log('Cant go to previous');
      return;
    }
    if (this.seek <= 5) {
      this.currentPlaylistIndex--;
      this.audioPlayerService.triggerVideoEvent({index: this.currentPlaylistIndex, playlist: this.currentPlaylist});
      return;
    }
  }

  private checkCurrentPlaylist() {
    for (let i = 0; i < this.currentPlaylist.length; i++) {
      const video = this.currentPlaylist[i];
      if (video.id === this.audioPlayerService.getPlayingVideo().id) {
        this.playlistIndex = i;
        break;
      }
    }
  }

  public toggle() {
    if (this.activeSound) {
      if (this.activeSound.playing()) {
        this.activeSound.pause();
      } else {
        this.activeSound.play();
      }
    }
  }

  public seekNext() {
    this.audioPlayerService.triggerPlaylistActionEvent({action: 'next'});
  }

  public seekPrev() {
    this.audioPlayerService.triggerPlaylistActionEvent({action: 'prev'});
  }

  public bindMouseMoveSeekBar($event, elementWidth, duration) {
    if (this.activeSound) {
      this.seekBarHandlePosX = ($event.offsetX / elementWidth) * 100;
      const seconds = UtilsService.formatDuration(duration);
      const seekPosition = seconds * (this.seekBarHandlePosX / 100);
      this.seekTimer = UtilsService.formatTime(seekPosition);
      $event.stopPropagation();
    }
  }

  public seekToPosition($event, position, duration) {
    if (this.activeSound) {
      const seconds = UtilsService.formatDuration(duration);
      const seekPosition = Math.round(seconds * (position / 100));
      if (this.activeSound && !this.activeSound.playing()) {
        this.activeSound.play();
      }
      this.activeSound.seek(seekPosition);
      $event.stopPropagation();
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async playMedia(video) {
    if (this.videoServiceLock) {
      console.log('Cant select a video right now');
      return;
    }
    this.videoServiceLock = true;
    this.audioPlayerService.triggerToggleLoading({id: video.id, toggle: true});
    this.audioPlayerService.triggerTogglePlaying({id: video.id, toggle: false});
    this.retryCount = 0;
    this.progress = '0';
    this.clearAudio();
    this.video = video;
    if (!this.isChrome) {
      this.fetchedStreamUrl = {};
      this.fetchedStreamUrl.success = false;
      this.buildAudioObject();
      this.videoCount++;
      return;
    }
    this.fetchAudioStream(this.video.id);
    let count = 0;
    do {
      await this.sleep(250);
      if (count > 40) {
        console.error('Unable to retrieve stream URL');
        this.streamPrefetchSubscription.unsubscribe();
        this.fetchedStreamUrl = {success: false};
      }
      count++;
    }
    while (this.fetchedStreamUrl === null);
    this.buildAudioObject();
  }

  private buildAudioObject() {
    let streamUrl: string;
    if (this.fetchedStreamUrl.success === true) {
      streamUrl = (this.fetchedStreamUrl.audioOnly && this.fetchedStreamUrl.matchesExtension) ? this.fetchedStreamUrl.streamUrl : (environment.streamUrl + '/stream/' + btoa(this.fetchedStreamUrl.streamUrl));
    } else {
      streamUrl = environment.streamUrl + '/stream/videos/' + this.video.id;
    }

    this.activeSound = new Howl({
      src: [streamUrl],
      html5: true,
      buffer: true,
      preload: false,
      autoplay: false,
      onplay: () => {
        this.duration = this.video.duration;
        this.showNowPlayingBar = true;
        this.audioPlayerService.setPlaylingVideo(this.video);
        this.titleService.setTitle(this.video.title + ' - ' + this.video.owner);
        this.hasPrefetched = false;
        this.audioPlayerService.triggerTogglePlaying({id: this.video.id, toggle: true});
        this.checkCurrentPlaylist();
        requestAnimationFrame(this.step.bind(this));
      },
      onpause: () => {
        // Leave this as an exception
        this.isPlaying = false;
      },
      onplayerror: (e) => {
        console.error(e);
        this.audioPlayerService.triggerToggleLoading({id: this.video.id, toggle: false});
        this.notificationService.showNotification({type: 'error', message: 'Sorry :( There was an error playing this video.'});
        this.videoServiceLock = false;
      },
      onloaderror: (e) => {
        console.error(e);
        this.audioPlayerService.triggerToggleLoading({id: this.video.id, toggle: false});
        this.notificationService.showNotification({type: 'error', message: 'Sorry :( There was an error loading this video.'});
        this.videoServiceLock = false;
      },
      onend: () => {
        this.goToUpNextVideo();
        // this.audioPlayerService.triggerPlaylistActionEvent({action: 'next'});
      },
      onload: () => {
        const nowPlayingList = [];
        nowPlayingList.push(this.video);
        this.audioPlayerService.triggerNowPlayingVideoEvent(nowPlayingList);
        this.streamPrefetchService.updateVideoWatched(this.video.id).subscribe(() => {
          console.log('Successfully updated video as watched on load of video');
        }, (error) => {
          console.error('Error updating video as watched: ' + error);
        });
        this.audioPlayerService.triggerToggleLoading({id: this.video.id, toggle: false});
        this.videoServiceLock = false;
      }
    });
    this.activeSound.play();
  }

  private clearAudio() {
    this.fetchedStreamUrl = null;
    this.showNowPlayingBar = false;
    if (this.activeSound) {
      this.activeSound.unload();
      this.titleService.setTitle('moup.io');
    }
  }

  private fetchAudioStream(videoId: string) {
    // Fetch Stream URL
    this.streamPrefetchSubscription = this.streamPrefetchService.prefetchStreamUrl(videoId).subscribe((resp) => {
      this.fetchedStreamUrl = resp;
      // Fetch Recommended Videos
      this.videoRecommendedService.recommended(this.video.id);
    }, (error) => {
      console.error('Error fetching stream url for video id ' + this.video.id);
      this.audioPlayerService.triggerToggleLoading({id: this.video.id, toggle: false});
      this.notificationService.showNotification({type: 'error', message: 'Sorry :( There was an error playing this video.'});
      this.videoServiceLock = false;
    });
  }

  private prefetchAudioStream() {
    if (this.currentPlaylist.length === (this.currentPlaylistIndex + 1)) {
      console.log('Last video in the playlist. Not pre-fetching media stream.');
      return;
    }
    const prefetchVideoId: string = this.currentPlaylist[this.currentPlaylistIndex + 1].id;
    this.streamPrefetchSubscription = this.streamPrefetchService.prefetchStreamUrl(prefetchVideoId).subscribe((resp) => {
    }, (error) => {
      console.error('Error prefetching stream url for video id ' + this.video.id);
    });
  }

  private step() {
    if (this.activeSound) {
      this.seek = this.activeSound ? this.activeSound.seek() : 0;
      const duration: number = UtilsService.formatDuration(this.audioPlayerService.getPlayingVideo().duration);
      this.progress = (((this.seek / duration) * 100) || 0);
      this.elapsed = UtilsService.formatTime(Math.round(this.seek));
      // PREFETCH VIDEO URL -- 10/21 - No longer necessary
      if ((duration - Math.floor(this.seek)) === 15 && !this.hasPrefetched) {
        console.log('Prefetching next media stream');
        this.hasPrefetched = true;
        this.prefetchAudioStream();
      }
      if (this.activeSound.playing()) {
        requestAnimationFrame(this.step.bind(this));
      }
    }
  }

  ngOnDestroy() {
    this.videoEventSubscription.unsubscribe();
    this.videoPlayingEventSubscription.unsubscribe();
    this.videoLoadingEventSubscription.unsubscribe();
    this.playlistUpdateEventSubscription.unsubscribe();
    this.streamValidatorSubscription.unsubscribe();
    this.eventBusSubscription.unsubscribe();
    this.playlistActionSubscription.unsubscribe();
    this.streamPrefetchSubscription.unsubscribe();
    this.streamRecPrefetchSubscription.unsubscribe();
    this.upNextVideoEventSubscription.unsubscribe();
  }

}
