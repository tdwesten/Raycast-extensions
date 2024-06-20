import { Color, Icon } from "@raycast/api";
import { nanoid } from "nanoid";
import RoomEvent from "./room_event.dto";

export class Room {
  id: string;
  name: string;
  floor: string;
  events: RoomEvent[];

  constructor(id: string, name: string, floor: string, events: RoomEvent[]) {
    this.id = id;
    this.name = name;
    this.floor = floor;
    this.events = events;
  }

  static fromJSON(data: any): Room {
    return new Room(
      nanoid(),
      data.name,
      data.floor,
      data.events.map((event: any) => RoomEvent.fromJSON(event)),
    );
  }

  get upComingEvent(): RoomEvent | undefined {
    const now = new Date();
    return this.events.find((event) => event.start > now);
  }

  get currentEvent(): RoomEvent | undefined {
    const now = new Date();
    return this.events.find((event) => event.start < now && event.end > now);
  }

  get availabilityMessage(): string {
    if (this.currentEvent) {
      return "In use";
    }

    if (this.upComingEvent) {
      return "Available until " + this.upComingEvent.start?.toLocaleTimeString();
    }

    return "Available";
  }

  get subTitle(): string {
    return (
      `(${this.floor})` +
      (this.upComingEvent
        ? " - " + this.upComingEvent?.summary + " @ " + this.upComingEvent.start?.toLocaleTimeString()
        : "")
    );
  }

  get available(): boolean {
    return !this.currentEvent;
  }

  get icon(): { source: string; tintColor: string } {
    return {
      source: this.available ? Icon.Circle : Icon.CircleDisabled,
      tintColor: this.available ? Color.Green : Color.Red,
    };
  }
}
