import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { interval, Observable, of } from 'rxjs';
import { bufferCount, combineLatestAll, concatAll, concatMap, delay, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Player } from '../interfaces/player';
import { Team } from '../interfaces/team';

@Injectable({
  providedIn: 'root'
})
export class NflFeedService {
  private serviceUrl = 'http://localhost:4200/api/sportsFeeds' //`${environment.baseUrl}/stores`;  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 
    "Authorization": "Basic ODM3NjU3YzMtNzllOS00NTU3LWFmMjAtNzQ5ODBmOk1ZU1BPUlRTRkVFRFM="})
  };
  constructor(private http: HttpClient, private toastr: ToastrService) { }

  getPlayers() : Observable<{players: Player[], teams: Team[]}>{
    return this.http.get<any>(`${this.serviceUrl}/players.json`, this.httpOptions)
    .pipe(
      map((itm: any) => {return {
        references: itm.references,
        players: itm.players,
      }})
     )
    .pipe(
      map((item: {references: any, players: any}) =>
      {return {
        players: item.players.map((innerItem: any) => <Player>{
          firstName: innerItem.player.firstName,
          lastName: innerItem.player.lastName,
          imgSrc: innerItem.player.officialImageSrc,
          position: innerItem.player.primaryPosition,
          age: innerItem.player.age,
          college: innerItem.player.college,
          teamId: innerItem.player.teamAsOfDate?.id,
          teamAbbrev: innerItem.player.teamAsOfDate?.abbreviation,
        }),
        teams: item.references.teamReferences.map((innerItem: any) => <Team>{
          teamId: innerItem.id,
          city: innerItem.city,
          name: innerItem.name,
          abbrev: innerItem.abbreviation,
          imgSrc: innerItem.officialLogoImageSrc,
        })
      }}
    ));
  }
}
