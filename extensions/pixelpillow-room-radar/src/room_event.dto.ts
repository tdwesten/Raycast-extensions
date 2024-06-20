export default class RoomEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  link: string;

  constructor(id: string, summary: string, start: Date, end: Date, link: string) {
    this.id = id;
    this.summary = summary;
    this.start = start;
    this.end = end;
    this.link = link;
  }

  static fromJSON(data: any): RoomEvent {
    return new RoomEvent(data.id, data.summary, new Date(data.start), new Date(data.end), data.link);
  }

  get subTitle(): string {
    return (
      this.start.toDateString() +
      " " +
      this.start.toLocaleTimeString() +
      " -> " +
      this.end.toDateString() +
      " " +
      this.start.toLocaleTimeString()
    );
  }
}
