import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module'; // Import SharedModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit  {
  nameForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) { }

   ngOnInit(): void {
    this.nameForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  submitForm() {
    const uuid = uuidv4();
    if (this.nameForm.valid) {
      const newValue:Person = { uuid: uuid, name: this.nameForm.value.name };
      this.checkLocalStorageForPersonObjectAndUpdate(newValue);
      this.redirectToChatComponentWithParam(uuid);
    }
  }

  redirectToChatComponentWithParam(uuid: string) {
    this.router.navigate(['/chat', uuid]);
  }

  checkLocalStorageForPersonObjectAndUpdate(newPerson: Person) {
    const personString = localStorage.getItem('person');

    if (personString) {
        try {
            const personArray: Person[] = JSON.parse(personString);
            const uuidExists = personArray.some(person => person.uuid === newPerson.uuid);
            if (!uuidExists) {
                personArray.push(newPerson);
                localStorage.setItem('person', JSON.stringify(personArray));
                console.log('New person added:', newPerson);
                return true;
            } else {
                console.log('UUID already exists, new person not added');
                return false;
            }
        } catch (error) {
            console.error('Error parsing value for "person" key:', error);
            return false;
        }
    } else {
        try {
            const newArray = Array.isArray(newPerson) ? newPerson : [newPerson];
            localStorage.setItem('person', JSON.stringify(newArray));
            console.log('New value added for "person" key:', newArray);
            return true;
        } catch (error) {
            console.error('Error adding new value for "person" key:', error);
            return false;
        }
    }
  }
}

interface Person {
  uuid: string;
  name: string;
}