import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import jaLocale from "@fullcalendar/core/locales/ja";
import listPlugin from "@fullcalendar/list";
import Burger from "./burger/burger";
import { startOfDay, subDays } from "date-fns"; // date-fns ライブラリを利用

interface Event {
  title: string;
  start: Date | string;
  allDay: boolean;
  description: string;
  id: number;
}

export default function Memories() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start: "",
    allDay: false,
    id: 0,
    description: "",
  });

  useEffect(() => {
    const yesterday = subDays(new Date(), 1); // 昨日の日付を取得
    const startOfToday = startOfDay(new Date()); // 今日の始まり

    // 昨日までの日付にDoneを追加
    let tempEvents: Event[] = [];
    for (
      let d = new Date(yesterday);
      d <= startOfToday;
      d.setDate(d.getDate() + 1)
    ) {
      tempEvents.push({
        title: "DoneBurger",
        start: new Date(d),
        allDay: true,
        description: "",
        id: 0,
      });
    }
    // イベントリストに追加
    setAllEvents((prevEvents) => [...prevEvents, ...tempEvents]);
    setAllEvents((prevEvents) => [...prevEvents, ...tempEvents]);
  }, []);

  //month表示から日をクリックしたときの処理
  //新しいeventを作成して、現在時刻のタイムスタンプをidに設定している。
  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    setNewEvent({
      ...newEvent,
      start: arg.date,
      allDay: arg.allDay,
      id: new Date().getTime(),
    });
    setShowModal(true);
  }

  //modalwindowを閉じる処理
  //setNewEventでフォームをリセットすることで、過去の情報を残さない。
  function handleCloseModal() {
    setShowModal(false);
    setNewEvent({
      title: "",
      start: "",
      allDay: false,
      id: 0,
      description: "",
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      title: e.target.value,
    });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAllEvents([...allEvents, newEvent]);
    setShowModal(false);
    setNewEvent({
      title: "",
      start: "",
      allDay: false,
      id: 0,
      description: "",
    });
  }

  return (
    <>
      <nav className="flex justify-between mb-2 border-b border-violet-100 p-2">
        <h1> </h1>
      </nav>
      <main className="flex min-h-screen flex-col items-center justify-between px-4 py-2">
        <div className="grid grid-cols-1">
          <div className="col-span-8">
            <FullCalendar
              locales={[jaLocale]}
              locale={jaLocale}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              headerToolbar={{
                left: "title,prev,next today",
                center: "title",
                right: "dayGridMonth",
              }}
              events={allEvents as EventSourceInput}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
            />
          </div>
        </div>

        {/* ここで、クリックしたらmodalを開いて、そのあとにmodalを閉じるとかを管理している。*/}
        {/* transitionはheadless uiのやつ。*/}

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-md sm:p-6">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold leading-6 text-gray-900"
                        >
                          Add Event
                        </Dialog.Title>
                        {/* ここで追加を管理 */}
                        <form onSubmit={handleSubmit}>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600"
                              value={newEvent.title}
                              onChange={handleChange}
                              placeholder="Title"
                            />
                            <input
                              type="text"
                              name="description"
                              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 mt-4"
                              value={newEvent.description}
                              onChange={handleChange}
                              placeholder="Description"
                            />
                          </div>
                          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md bg-violet-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                              disabled={newEvent.title === ""}
                            >
                              Create
                            </button>
                            <button
                              type="button"
                              className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              onClick={handleCloseModal}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
}
