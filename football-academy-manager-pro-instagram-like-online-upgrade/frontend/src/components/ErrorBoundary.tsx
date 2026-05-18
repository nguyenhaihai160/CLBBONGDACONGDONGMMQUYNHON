import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Không xác định được lỗi',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Frontend crash:', error, info);
  }

  clearCacheAndReload = async () => {
    try {
      localStorage.removeItem('fam_token');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn('Không thể xóa cache trước khi tải lại:', error);
    }
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-900">
        <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-green-600">Academy Pro</p>
          <h1 className="mt-2 text-2xl font-black">Ứng dụng đang gặp lỗi hiển thị</h1>
          <p className="mt-3 text-sm text-slate-600">
            Thay vì trắng màn hình, bản này sẽ hiện thông báo để anh dễ xử lý. Lỗi thường gặp là cache PWA cũ hoặc dữ liệu đăng nhập cũ.
          </p>
          {this.state.message && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-2xl bg-slate-100 p-3 text-xs text-slate-700">{this.state.message}</pre>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => window.location.reload()} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white">
              Tải lại
            </button>
            <button onClick={this.clearCacheAndReload} className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white">
              Xóa cache và về đăng nhập
            </button>
          </div>
        </section>
      </main>
    );
  }
}
