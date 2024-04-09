import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../shared/shared.module'; // Import SharedModule
import { ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  uuid: string;
  person: Person | null;
  chat: Message | null;
  messageForm: FormGroup;
  allMessages: Message;
  message: Message[];
  private pollingSubscription: Subscription;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Extract UUID from route parameters
      this.uuid = params.get('uuid') as string;
      this.person = this.checkLocalStorageForPersonObject(this.uuid)
      this.fetchData();
    });

    this.messageForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the polling subscription to avoid memory leaks
    this.pollingSubscription.unsubscribe();
  }

  fetchData() {
    const allMessages = getMessagesFromLocalStorage();
    this.message = getFirst25Messages(allMessages);
    console.log("🚀 ~ ChatComponent ~ fetchData ~ message:", this.message)
    this.message.sort((a, b) => {
      if (a.createdAt instanceof Date && b.createdAt instanceof Date) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0; 
    });
    setTimeout(() => {
      this.fetchData();
    }, 1000);
  
  }

  submitForm() {
    const uuid = uuidv4();
    if (this.messageForm.valid && this.person) { 
      const newValue:Message = { 
        uuid: uuid,
        personUuid: (this.person? this.person?.uuid: null),
        name:  (this.person? this.person?.name: null),
        message: this.messageForm.value.name,
        createdAt: new Date() 
      };
      this.checkLocalStorageForMessageObjectAndUpdate(newValue);
      this.fetchData();
    }
  }


  checkLocalStorageForPersonObject(uuid: string) : Person | null {
    const personString = localStorage.getItem('person');

    if (personString) {
        try {
            const personArray: Person[] = JSON.parse(personString);
            const uuidExists = personArray.find(person => person.uuid === uuid);
            if (!uuidExists) {
                console.log('UUID not found');
                return null;
            } else {
                return uuidExists;
            }
        } catch (error) {
            console.error('Error parsing value for "person" key:', error);
            return null;
        }
    } else {
        try {
            console.log('UUID not found');
            return null;
        } catch (error) {
            console.error('Error adding new value for "person" key:', error);
            return null;
        }
    }
  }

  checkLocalStorageForMessageObjectAndUpdate(newMessage: Message) {
    const messageString = localStorage.getItem('message');

    if (messageString) {
        try {
            const messageArray: Message[] = JSON.parse(messageString);
            const uuidExists = messageArray.some(message => message.uuid === newMessage.uuid);
            if (!uuidExists) {
                messageArray.push(newMessage);
                localStorage.setItem('message', JSON.stringify(messageArray));
                console.log('New message added:', newMessage);
                return true;
            } else {
                console.log('UUID already exists, new message not added');
                return false;
            }
        } catch (error) {
            console.error('Error parsing value for "message" key:', error);
            return false;
        }
    } else {
        try {
            const newArray = Array.isArray(newMessage) ? newMessage : [newMessage];
            localStorage.setItem('message', JSON.stringify(newArray));
            console.log('New value added for "message" key:', newArray);
            return true;
        } catch (error) {
            console.error('Error adding new value for "message" key:', error);
            return false;
        }
    }
  }

}
interface Person {
  uuid: string;
  name: string;
}
interface Message {
  uuid: string;
  personUuid: string | null;
  name: string | null;
  message: string;
  createdAt: Date;
}


  function getMessagesFromLocalStorage(): Message[] {
    const messagesString = localStorage.getItem('message');
      if (messagesString) {
          // Parse the stored string into an array of Message objects
          return JSON.parse(messagesString);
      } else {
          // If no data found, return an empty array
          return [];
      }
  }

  function getFirst25Messages(messages: Message[]): Message[] {
      // Slice the array to get the first 25 messages
      return messages.slice(0, 25);
  }