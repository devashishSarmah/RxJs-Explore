import 'zone.js/dist/zone';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { from, map, Observable, switchMap, tap, first, of, combineLatest, filter } from 'rxjs';

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
    <p>SwitchMap</p>
    <ul>
    <li *ngFor="let user of users$ | async">{{ user.name }} - {{ user.age }}</li>
    </ul>
  `,
})
export class App implements OnInit {
  users$: Observable<(User & UserDetail)[]>;

  ageGroupFilter$: Observable<{ upper: number, lower: number }> = of({ upper: 60, lower: -1 });
  nameFilter$: Observable<string> = of('');

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
        switchMap((user: User) =>
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

      combineLatest([
        this.users$,
        this.ageGroupFilter$,
        this.nameFilter$
      ]).pipe(
        map(([users, ageGroup, nameCharacters]) => {
          return users.filter((user) => user.age >= ageGroup.lower && user.age <= ageGroup.upper && user.name.toLowerCase().includes(nameCharacters.toLowerCase()));
        }),
        tap((users) => { this.users$ = from([users]); })
      ).subscribe()
  }

  getUsers(): Observable<User> {
    return from(Users);
  }

  getUserDetailsById(id: User['id']): Observable<UserDetail> {
    return from(UserDetails.filter((userDetail) => userDetail.id === id));
  }
}

bootstrapApplication(App);
