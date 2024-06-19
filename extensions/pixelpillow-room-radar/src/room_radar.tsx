import { Action, ActionPanel, Color, Icon, List, getPreferenceValues, showToast, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { nanoid } from "nanoid";

type Room = {
  name: string;
  id: string;
  resourceEmail: string;
  available?: boolean;
  availability: string;
  availabilityMessage?: string;
  availabilityIcon?: string;
  events: Event[];
  upCommingEvent?: Event;
  floor: string;
};

type Event = {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  link: string;
};

interface FetchResponse {
  isLoading: boolean;
  data: Room[];
  revalidate: unknown;
}

// Component om de lijst van kamers weer te geven
export default function Command() {
  const { push } = useNavigation();
  const { username, password, url } = getPreferenceValues();

  if (!username || !password) {
    showToast({
      title: "Gebruikersnaam en wachtwoord zijn vereist",
      message: "Stel je gebruikersnaam en wachtwoord in om de kamers weer te geven",
    });
  }

  const { isLoading, data } = useFetch<FetchResponse>(url, {
    headers: {
      Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  });

  const availabitityMessageUntilNextEvent = (event: Event | undefined) => {
    if (event) {
      return "Beschikbaar tot " + new Date(event.start).toLocaleTimeString();
    }

    return "Beschikbaar";
  };

  let roomData: Room[] | undefined;

  if (data === undefined && !isLoading) {
    return (
      <List>
        <List.EmptyView
          icon={{ source: "https://media1.tenor.com/m/4krG6BSnulUAAAAC/malfunction-system-malfunction.gif" }}
          title="API DOWN! CALL MILAN!"
        />
      </List>
    );
  }

  if (data && Array.isArray(data)) {
    roomData = data?.map((room: Room) => {
      room.id = nanoid();

      const now = new Date();
      const event = room.events.find((event) => new Date(event.start) < now && new Date(event.end) > now);
      const upCommingEvent = room.events.filter((event) => new Date(event.start) > now);
      room.upCommingEvent = upCommingEvent.length > 0 ? upCommingEvent[0] : undefined;

      room.availabilityMessage = event ? "In gebruik" : availabitityMessageUntilNextEvent(room.upCommingEvent);
      room.availabilityIcon = event ? Icon.Dot : Icon.Dot;
      room.availability = event
        ? event.summary + " (" + event.start.toLocaleTimeString() + " -> " + event.end.toLocaleTimeString() + ")"
        : "Beschikbaar";

      room.available = event ? false : true;

      return room;
    });
  }

  const renderSubtitle = (room: Room) => {
    return (
      `(${room.floor})` +
      (room.upCommingEvent
        ? " - " + room.upCommingEvent?.summary + " @ " + new Date(room.upCommingEvent.start).toLocaleTimeString()
        : "")
    );
  };

  return (
    <List searchBarPlaceholder="Doorzoek de ruimtes..." isLoading={isLoading}>
      {roomData?.map((room: Room) => (
        <List.Item
          key={room.id}
          title={room.name}
          subtitle={renderSubtitle(room)}
          accessories={[
            {
              text: { value: room.availabilityMessage },
              icon: { tintColor: room.available ? Color.Green : Color.Red, source: room.availabilityIcon ?? Icon.Dot },
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="Bekijk Events" onAction={() => push(<RoomEventList events={room.events} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function RoomEventList({ events }: { events: Event[] }) {
  return (
    <List>
      {events.length === 0 && (
        <List.EmptyView
          icon={{ source: "https://media1.tenor.com/m/A3uAfeQrWmMAAAAd/nothing-here-searching.gif" }}
          title="No events found"
        />
      )}

      {events.map((event: Event) => (
        <List.Item
          key={event.summary}
          title={event.summary}
          subtitle={
            new Date(event.start).toDateString() +
            " " +
            new Date(event.start).toLocaleTimeString() +
            " -> " +
            new Date(event.end)?.toDateString() +
            " " +
            new Date(event.start).toLocaleTimeString()
          }
          actions={
            <ActionPanel>{event.link && <Action.OpenInBrowser title="Bekijk Event" url={event.link} />}</ActionPanel>
          }
        />
      ))}
    </List>
  );
}
