const db = require("../../../config/database");
const {
  addEvent,
  dateToFormatedDate,
} = require("../../../utils/eventFunctions");
const validationSchema = require("./validation");

// GET

const getById = async (req, res) => {
  const { event_id } = req.params;
  const user = req.user;

  const response = await db("apartment_events")
    .where({ event_id: event_id, user_id: user.id })
    .select()
    .first();

  if (!response) {
    return res.json({ msg: "No apartment event found", data: null });
  }

  return res.json({ msg: "Got apartment event", data: response });
};

const getByDate = async (req, res) => {
  const { date } = req.params;
  const user = req.user;

  const response = await db("apartment_events")
    .where({ user_id: user.id })
    .andWhere(
      db.raw(
        "to_date(?, 'YYYY-MM-DD') between to_date(date_in, 'YYYY-MM-DD') and to_date(date_out, 'YYYY-MM-DD')",
        [dateToFormatedDate(date)]
      )
    )
    .select();

  if (!response.length) {
    return res.json({ msg: "No apartment events found", data: [] });
  }

  return res.json({ msg: "Got apartment events", data: response });
};

// POST, PUT

const createEvent = async (req, res) => {
  const event_id = await addEvent();

  if (!event_id) {
    throw new Error("Could not create event");
  }

  const response = await db("apartment_events")
    .insert({
      event_id: event_id,
      user_id: req.user.id,
      date_created: new Date(),
    })
    .returning("id");

  const id = response[0]?.id;

  if (!id) {
    throw new Error("Could not create apartment event");
  }

  return res.json({
    msg: "Created apartment event",
    data: {
      event_id: event_id,
    },
  });
};

const updateEvent = async (req, res) => {
  const { event_id } = req.params;
  const {
    guest,
    n_adults,
    n_children,
    date_in,
    date_out,
    bed_and_breakfast,
    details,
    price,
  } = req.body;

  const insertBody = {
    guest: guest,
    n_adults: n_adults,
    n_children: n_children,
    date_in: dateToFormatedDate(date_in),
    date_out: dateToFormatedDate(date_out),
    bed_and_breakfast: bed_and_breakfast,
    details: details,
    price: price,
    date_updated: new Date(),
  };

  const { error, value } = validationSchema.validate(insertBody);

  if (error) throw error;

  const where = { event_id: event_id, user_id: req.user.id };

  const response = await db("apartment_events")
    .where(where)
    .update(insertBody)
    .returning("id");

  const response_id = response[0]?.id;

  if (!response_id) throw new Error("Could not update resoraunt event");

  return res.json({
    msg: "Updated apartment event",
    data: {
      id: response_id,
    },
  });
};

// APARTMENTS

const getApartments = async (req, res) => {
  const { event_id } = req.params;

  const response = await db("event_apartments")
    .where({ user_id: req.user.id, event_id: event_id })
    .select("apartment_id");

  const ids = response.map((el) => el["apartment_id"]);

  if (!ids.length) {
    return res.json({ msg: "No apartments found", data: [] });
  }

  const apartments = await db("apartments")
    .where({ user_id: req.user.id })
    .whereIn("id", ids);

  return res.json({ msg: "Got apartments", data: apartments });
};

const updateApartments = async (req, res) => {
  const { event_id } = req.params;
  const { selected_ids } = req.body;

  await db("event_apartments")
    .where({ event_id: event_id, user_id: req.user.id })
    .del();

  const tableData = selected_ids.map((id) => {
    return {
      apartment_id: id,
      user_id: req.user.id,
      event_id: event_id,
      date_updated: new Date(),
    };
  });

  await db("event_apartments").insert(tableData);

  return res.json({
    msg: "Updated apartment event apartments",
  });
};

const deleteEvent = async (req, res) => {
  const { event_id } = req.params;

  await db("apartment_events")
    .where({
      event_id: event_id,
      user_id: req.user.id,
    })
    .del();

  await db("event_apartments")
    .where({ user_id: req.user.id, event_id: event_id })
    .delete();

  return res.json({ msg: "Deleted apartment event", data: null });
};

module.exports = {
  getById,
  getByDate,
  createEvent,
  updateEvent,
  getApartments,
  updateApartments,
  deleteEvent,
};
