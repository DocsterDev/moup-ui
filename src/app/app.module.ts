import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import {trigger,state,style,animate,transition}from '@angular/animations';


import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {ContainerComponent} from './container/container.component';
import {VideoComponent} from './container/content/video/video.component';
import {AudioComponent} from './container/content/audio/audio.component';
import {ContentComponent} from './container/content/content.component';
import {SideNavComponent} from './container/side-nav/side-nav.component';
import {RouterModule} from '@angular/router';
import {appRoutes} from './app.routes';
import {TileComponent} from './common/tile/tile.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MetadataService} from './service/metadata.service';
import {UserService} from './service/user.service';
import {FormsModule} from '@angular/forms';
import {ModalModule} from 'ngx-bootstrap';
import {YoutubeComponent} from './container/content/youtube/youtube.component';
import {UtilsService} from './service/utils.service';
import {LoaderComponent} from './common/loader/loader.component';
import {SearchCardComponent} from './container/content/youtube/search-card/search-card.component';
import {VideoService} from './service/video.service';
import {NotificationComponent} from './global/notification/notification.component';
import {GlobalHttpInterceptor} from './global/http-interceptor/global-http-interceptor';
import {HttpModule} from '@angular/http';
import {NotificationService} from './global/notification/notification.service';
import {AudioPlayerComponent} from './global/audio-player/audio-player.component';
import {AudioPlayerService} from './global/audio-player/audio-player.service';
import {MomentModule} from 'angular2-moment';
import {ConfigService} from './service/config.service';
import {PlaylistService} from './service/playlist.service';
import {VideoRecommendedService} from './service/video-recommended.service';
import {VideoAutoCompleteService} from './service/video-autocomplete.service';
import {VideoSearchService} from './service/video-search.service';
import {VideoMetadataService} from './service/video-metadata.service';
import {Ng2Webstorage} from 'ngx-webstorage';
import {PlaylistCardComponent} from './container/content/youtube/playlist-card/playlist-card.component';
import {NgxSmoothDnDModule} from 'ngx-smooth-dnd';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ContentComponent,
    SideNavComponent,
    ContainerComponent,
    VideoComponent,
    AudioComponent,
    TileComponent,
    YoutubeComponent,
    LoaderComponent,
    SearchCardComponent,
    PlaylistCardComponent,
    NotificationComponent,
    AudioPlayerComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    HttpModule,
    ModalModule.forRoot(),
    MomentModule,
    Ng2Webstorage,
    // DndModule.forRoot(),
    NgxSmoothDnDModule,
    BrowserAnimationsModule
  ],
  providers: [
    MetadataService,
    UserService,
    UtilsService,
    VideoService,
    VideoSearchService,
    VideoRecommendedService,
    VideoMetadataService,
    VideoAutoCompleteService,
    NotificationService,
    AudioPlayerService,
    ConfigService,
    PlaylistService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalHttpInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
