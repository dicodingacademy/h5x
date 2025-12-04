# H5X - Interactive Content Builder

A modern, production-ready platform for building interactive educational content, built with React Router v7, Drizzle ORM, and SQLite.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features & Screenshots

### Project Management
- **Create Project**: Easily create new interactive content projects.
  ![Create Project Screen](https://placehold.co/800x500?text=Create+Project+Screen)

### Content Types

#### 1. Multiple Choice
- Create engaging multiple-choice questions with feedback.
  ![Multiple Choice Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/multiple-choices.gif)

#### 2. True / False
- Simple true or false questions for quick checks.
  ![True False Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/true-false.gif)

#### 3. Interactive Video
- Add timed interactions (Facts, Quizzes) to HLS videos using Vidstack.
  ![Interactive Video Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/video-interactive.gif)

#### 4. Flash Card
- Flip cards for memorization and learning with 3D animations.
  ![Flash Card Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/flash-card.gif)

#### 5. Fill the Blank
- Drag and drop words to complete sentences using `@dnd-kit`.
  ![Fill the Blank Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/fill-the-blank.gif)

#### 6. Image Hotspot
- Interactive images with clickable hotspots that reveal popover information.
  ![Image Hotspot Preview](https://github.com/dicodingacademy/h5x/blob/0a9798afaad679ef73b19e27a52c7345d5e0c8f4/preview/image-spot.gif)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t h5x-app .

# Run the container
docker run -p 3000:3000 h5x-app
```

## Tech Stack

- **Framework**: React Router v7
- **Database**: SQLite with Drizzle ORM
- **Styling**: TailwindCSS & Shadcn UI
- **Video**: Vidstack
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

---

Built with ❤️ using React Router & Antigravity.
