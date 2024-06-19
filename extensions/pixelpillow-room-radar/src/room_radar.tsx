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
  upComingEvent?: Event;
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

// Component to display the list of rooms
export default function Command() {
  const { push } = useNavigation();
  const { username, password, url } = getPreferenceValues();

  if (!username || !password) {
    showToast({
      title: "Username and password are required",
      message: "Set your username and password to display the rooms",
    });
  }

  const { isLoading, data } = useFetch<FetchResponse>(url, {
    headers: {
      Authorization: "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  });

  const availabitityMessageUntilNextEvent = (event: Event | undefined) => {
    if (event) {
      return "Available until " + new Date(event.start).toLocaleTimeString();
    }

    return "Available";
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
      const upComingEvent = room.events.filter((event) => new Date(event.start) > now);
      room.upComingEvent = upComingEvent.length > 0 ? upComingEvent[0] : undefined;

      room.availabilityMessage = event ? "In use" : availabitityMessageUntilNextEvent(room.upComingEvent);
      room.availabilityIcon = event ? Icon.Dot : Icon.Dot;
      room.availability = event
        ? event.summary + " (" + event.start.toLocaleTimeString() + " -> " + event.end.toLocaleTimeString() + ")"
        : "Available";

      room.available = event ? false : true;

      return room;
    });
  }

  const renderSubtitle = (room: Room) => {
    return (
      `(${room.floor})` +
      (room.upComingEvent
        ? " - " + room.upComingEvent?.summary + " @ " + new Date(room.upComingEvent.start).toLocaleTimeString()
        : "")
    );
  };

  return (
    <List searchBarPlaceholder="Search for a room..." isLoading={isLoading}>
      {roomData?.map((room: Room) => (
        <List.Item
          key={room.id}
          title={room.name}
          icon={{
            source: room.available ? Icon.Circle : Icon.CircleDisabled,
            tintColor: room.available ? Color.Green : Color.Red,
          }}
          subtitle={renderSubtitle(room)}
          accessories={[
            {
              text: { value: room.availabilityMessage },
              icon: { tintColor: room.available ? Color.Green : Color.Red, source: room.availabilityIcon ?? Icon.Dot },
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="View Events" onAction={() => push(<RoomEventList events={room.events} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function RoomEventList({ events }: { events: Event[] }) {
  return (
    <List searchText="Search for a event">
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
          icon={Icon.Calendar}
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
            <ActionPanel>{event.link && <Action.OpenInBrowser title="View Event" url={event.link} />}</ActionPanel>
          }
        />
      ))}
    </List>
  );
}
