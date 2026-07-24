export default function AnnouncementBar() {
  return (
    <div className="bg-basil-900 text-cream/90 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <p className="truncate">
          Free delivery on your first order over $700
        </p>
        <p className="hidden sm:block shrink-0">
          Need help?{" "}
          <a href="contact" className="text-mango-400 hover:text-mango-500 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
