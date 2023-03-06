import 'zone.js/dist/zone';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { from, map, Observable, switchMap, tap } from 'rxjs';

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
    <ul>
    <li *ngFor="let user of users$ | async">{{ user.name }}</li>
    </ul>
  `,
})
export class App implements OnInit {
  users$: Observable<(User & UserDetail)[]>;
  ngOnInit(): void {
    Array(10)
      .fill(1)
      .forEach((val, index) => {
        Users.push({ id: index + 1, name: 'User ' + (index + 1) });
        UserDetails.push({ id: index + 1, age: (Math.random() * 70) | 0 });
      });

    this.users$ = this.getUsers().pipe(
      switchMap((user: User) =>
        this.getUserDetailsById(user.id).pipe(
          map((userDetail: UserDetail) => Object.assign(userDetail, user))
        )
      ),
      tap(console.log)
    );
  }

  getUsers(): Observable<User> {
    return from(Users);
  }

  getUserDetailsById(id: User['id']): Observable<UserDetail> {
    return from(UserDetails.filter((userDetail) => userDetail.id === id));
  }
}

bootstrapApplication(App);
