import { Injectable } from '@angular/core';
import {WebsocketService} from './websocket.service';
import {Observable, of, Subject, throwError} from 'rxjs';
import {catchError, map, retry, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TradeInfo} from './tradeInfo';


// const binHttpOptions = {
//   headers: new HttpHeaders({
//     'Content-Type':  'application/json',
//     'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
//     'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
//     'Access-Control-Allow-Origin': '*'
//   })
// };


@Injectable({
  providedIn: 'root'
})
export class BinanceService {

  symbols: Subject<string>;
  /*constructor(private wss: WebsocketService, private http: HttpClient) {
  }*/

  // getOrderBookTickers(): Observable<any> {
  //   return this.http.get<any>(`${environment.BINANCE_API_URL}/api/v3/ticker/bookTicker`, binHttpOptions).pipe(
  //     retry(3),
  //     tap(orderbook => console.log(`fetched Binance getOrderBookTickers`)),
  //     catchError(this.handleError('getOrderBookTickers', [])),
  //     map(orderbook => JSON.parse(orderbook))
  //   );
  // }

  listenSymbols(symbols: string[]): Subject<string> {
    if (this.symbols != null && this.symbols !== undefined) {
      this.symbols.complete();
    }

    let path: string = null;
    if (symbols !== null && symbols !== undefined) {
      path = '/stream?streams=' + symbols.map(sym => sym.toLowerCase() + '@ticker').join('/');
    } else {
      path = '/ws/!ticker@arr';
    }

    console.log(`Connecting to Binance ws: ${path}`);
    const wss: WebsocketService = new WebsocketService();

    this.symbols = <Subject<string>>wss
      .connect(`${environment.BINANCE_WSS_URL}${path}`).pipe(
        map((response: MessageEvent): string => {
        return response.data.toString();
        })
      );
    return this.symbols;

  //   if symbols:
  //   url = os.path.join(BinanceWebsocket.WS_URL,
  //     'stream?streams=' + '/'.join([s.lower() + '@ticker' for s in self.symbols]))
  // else:
  //   url = os.path.join(BinanceWebsocket.WS_URL, 'ws/!ticker@arr')
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      if (error.status === 0) {
        return throwError('Binance API ERROR');
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
