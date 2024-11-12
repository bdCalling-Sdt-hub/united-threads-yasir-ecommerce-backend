/* eslint-disable @typescript-eslint/ban-ts-comment */
import nodemailer from "nodemailer";
import config from "../config";

type TEmail = {
  to: string;
  html: string;
  subject: string;
  from?: string;
};

export const sendMail = async ({ to, html, subject, from }: TEmail) => {
  const transporter = nodemailer.createTransport({
    //@ts-ignore
    host: "smtp.gmail.com",
    port: config.email.port,
    secure: config.NODE_ENV !== "development",
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    //from: from || config.email.user, // sender address
    from: `nurmdopu428@gmail.com`, // sender address
    to: config.email.user,
    subject,
    html,
  });
};
