import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section className="relative bg-white dark:from-[#0f172a] dark:via-[#0f172a] dark:to-[#1e293b] py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Get in <span className="text-blue-600">Touch</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback,
            or just want to say hello — reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: " bb-icon-l bb-icon-map",
                title: "Our Location",
                text: "Hargeisa, Somaliland",
              },
              {
                icon: " bb-icon-l bb-icon-phone",
                title: "Phone Number",
                text: "+252 63 6379908",
              },
              {
                icon: " bb-icon-l bb-icon-inbox",
                title: "Email Address",
                text: "support@surmadd.com",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/70 dark:bg-white/5 p-6 rounded-2xl shadow-lg flex items-start gap-4 hover:shadow-2xl transition"
              >
                <div className="text-blue-600 text-4xl">
                  <i className={item.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-white/5 p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Your subject here"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:opacity-90 transition focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
