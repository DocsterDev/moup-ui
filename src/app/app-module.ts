import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {ContainerComponent} from './container/container.component';
import {AdComponent} from './container/ad/ad.component';
import {PlaylistComponent} from './container/playlist/playlist.component';
import {GenericComponent} from './container/content/generic/generic.component';
import {VendorComponent} from './container/content/vendor/vendor.component';
import {VideoComponent} from './container/content/generic/video/video.component';
import {AudioComponent} from './container/content/generic/audio/audio.component';
import {ContentComponent} from './container/content/content.component';
import {SideNavComponent} from './container/side-nav/side-nav.component';
import {RouterModule} from '@angular/router';
import {appRoutes} from './app.routes';


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
    GenericComponent,
    VendorComponent,
    VideoComponent,
    AudioComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
