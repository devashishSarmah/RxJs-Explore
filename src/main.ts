import 'zone.js/dist/zone';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  from,
  map,
  Observable,
  tap,
  of,
  combineLatest,
  mergeMap,
  Subject,
  takeUntil,
  Subscriber,
  concatWith,
  forkJoin,
} from 'rxjs';

type User = {
  id: number;
  name: string;
};

type UserDetail = {
  id: User['id'];
  age: number;
};

const Users: User[] = [];
const UserDetails: UserDetail[] = [];

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>SwitchMap, Merge Map, combineLatest, takeUntil, concatWith, forkJoin</p>
    <ul>
    <li *ngFor="let user of users$ | async">{{ user.name }} - {{ user.age }}</li>
    </ul>
  `,
})
export class App implements OnInit, OnDestroy {
  users$: Observable<(User & UserDetail)[]>;

  ageGroupFilter$: Observable<{ upper: number; lower: number }> = of({
    upper: Infinity,
    lower: -1,
  });
  nameFilter$: Observable<string> = of('');

  destroy$: Subject<number> = new Subject<number>();

  ngOnInit(): void {
    Array(10)
      .fill(1)
      .forEach((val, index) => {
        Users.push({ id: index + 1, name: 'User ' + (index + 1) });
        UserDetails.push({ id: index + 1, age: (Math.random() * 70) | 0 });
      });

    const users = [];

    this.getUsers()
      .pipe(
        takeUntil(this.destroy$),
        mergeMap((user: User) =>
          this.getUserDetailsById(user.id).pipe(
            map((userDetail: UserDetail) => Object.assign(userDetail, user))
          )
        ),
        tap((val) => users.push(val))
      )
      .subscribe({
        complete: () => {
          this.users$ = from([users]);
        },
      });

    combineLatest([this.users$, this.ageGroupFilter$, this.nameFilter$])
      .pipe(
        takeUntil(this.destroy$),
        map(([users, ageGroup, nameCharacters]) => {
          return users.filter(
            (user) =>
              user.age >= ageGroup.lower &&
              user.age <= ageGroup.upper &&
              user.name.toLowerCase().includes(nameCharacters.toLowerCase())
          );
        }),
        tap((users) => {
          this.users$ = from([users]);
        })
      )
      .subscribe();

      const ob1$: Observable<number> = new Observable((subscriber: Subscriber<number>) => {
        subscriber.next(1);
        setTimeout(() => {
          subscriber.next(2);
          subscriber.complete();
        }, 3000);
      });

      const ob2$: Observable<number> = new Observable((subscriber: Subscriber<number>) => {
        subscriber.next(3);
        subscriber.complete();
      });

      ob1$.pipe(concatWith(ob2$), tap(console.log)).subscribe();

      const obForkJoined$ = forkJoin({
        name: of('User 1', 'User 2'),
        age: of(24, 26)
      }).pipe(tap(console.log));

      obForkJoined$.subscribe();


  }

  getUsers(): Observable<User> {
    return from(Users);
  }

  getUserDetailsById(id: User['id']): Observable<UserDetail> {
    return from(UserDetails.filter((userDetail) => userDetail.id === id));
  }

  ngOnDestroy(): void {
    this.destroy$.next(1);
  }
}

bootstrapApplication(App);
