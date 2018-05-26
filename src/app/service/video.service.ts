import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class VideoService {
  constructor(private http: HttpClient) {
  }

  /**
   * Get current videos of user on startup
   */
  getUserVideos(userId: string) {
    return this.http.get('http://localhost:8080/api/users/' + userId + '/videos');
  }

  /**
   * Add video by user
   */
  addUserVideo(userId: string, video: any) {
    this.http.post('http://localhost:8080/api/users/' + userId + '/videos', video).subscribe((response) => {
      console.log('Video successfully added for user');
      // TODO: Potential failure points are if the video is restricted and or if it cant find it for some reason
    }, (error) => {
      // TODO Remove added video if this fails
      console.log(JSON.stringify(error));
    });
  }

  /**
   * Delete video by user
   */
  deleteUserVideo(userId: string, videoId: string) {
    this.http.delete('http://localhost:8080/api/users/' + userId + '/videos/' + videoId).subscribe((response) => {
      console.log('Video successfully deleted for user');
      // TODO: Potential failure points are if the video is restricted and or if it cant find it for some reason
    }, (error) => {
      // TODO Remove added video if this fails
      console.log(JSON.stringify(error));
    });
  }

}
