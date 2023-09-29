import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from 'src/app/interface/config';
import { Observable } from 'rxjs';


@Injectable()
export class ConfigService {
  configUrl = 'assets/config.json';
  private configuration: Config | undefined;

  constructor(private http: HttpClient) { }

  readConfig(): Config | undefined {
    return this.configuration;
  }

  loadConfig() {
    console.log("Load config...");
    return new Observable((subscriber) => {

      this.http.get<Config>(this.configUrl).subscribe(res => {
        console.log("Load config success!");
        this.configuration = res;
        subscriber.complete();
      }, error => {
        console.log("Load config error:");
        console.log(error);
        subscriber.error();
      });
    });
  }
}