import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {ContainerComponent} from './container/container.component';
import {AdComponent} from './container/ad/ad.component';
import {PlaylistComponent} from './container/playlist/playlist.component';
import {VideoComponent} from './container/content/video/video.component';
import {AudioComponent} from './container/content/audio/audio.component';
import {ContentComponent} from './container/content/content.component';
import {SideNavComponent} from './container/side-nav/side-nav.component';
import {RouterModule} from '@angular/router';
import {appRoutes} from './app.routes';
import {TileComponent} from './common/tile/tile.component';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {FileDropModule} from 'ngx-file-drop';
import {FileUploadService} from './service/file-upload.service';
import {HttpClientModule} from '@angular/common/http';
import {ProgressHttpModule} from 'angular-progress-http';
import {HttpModule} from '@angular/http';
import {MetadataService} from './service/metadata.service';
import {UserService} from './service/user.service';
import {ConvertModalComponent} from './common/convert-modal/convert-modal.component';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'ng-custom-select';
import {ModalModule} from 'ngx-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ContentComponent,
    SideNavComponent,
    ContainerComponent,
    AdComponent,
    PlaylistComponent,
    VideoComponent,
    AudioComponent,
    TileComponent,
    ConvertModalComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    NgCircleProgressModule.forRoot(),
    FileDropModule,
    HttpClientModule,
    HttpModule,
    ProgressHttpModule,
    DropdownModule,
    ModalModule.forRoot()
  ],
  providers: [FileUploadService, MetadataService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
