import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormShell } from "./form/form-shell/form-shell";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormShell],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client-intake');
}
