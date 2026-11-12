import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Check,
  Heart,
  Grid2X2,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { categories, type Listing } from './data/listings'
import { useListings } from './lib/marketplace'
import {
  addDemoListing,
  completeDemoPurchase,
  clearDemoAccount,
  isDemoListingSold,
  markDemoListingSold,
  rateDemoTransaction,
  rateDemoPurchase,
  replyDemoMessage,
  sendDemoMessage,
  loginDemoAccount,
  registerDemoAccount,
  startDemoConversation,
  requestDemoPurchase,
  toggleDemoFavorite,
  useDemoStore,
} from './lib/demo-store'


function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SiteLayout />
    </BrowserRouter>
  )
}

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

function SiteLayout() {
  return (
    <div className="site-shell">
      <div className="preview-banner">
        <span className="preview-dot" />
        Dữ liệu chỉ lưu trên thiết bị này
      </div>
      <Header />
      <main id="top">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham/:id" element={<ProductPage />} />
          <Route path="/tin-da-luu" element={<SavedPage />} />
          <Route path="/dang-ban" element={<SellPage />} />
          <Route path="/cua-hang" element={<ShopPage />} />
          <Route path="/tin-nhan" element={<MessagesPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/huong-dan" element={<GuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="StuMarket, về trang chủ">
      <span className="brand-mark"><BookOpenCheck size={21} strokeWidth={2.1} /></span>
      <span className="brand-name">StuMarket<span className="brand-dot">.</span></span>
    </Link>
  )
}

function Header() {
  const demoStore = useDemoStore()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-main wrap">
        <a className="skip-link" href="#top">Đến nội dung chính</a>
        <Brand />
        <form className="header-search" role="search" onSubmit={submitSearch}>
          <Search size={18} aria-hidden="true" />
          <label className="search-field-label" htmlFor="header-query">Tìm</label>
          <input
            id="header-query"
            aria-label="Tìm sản phẩm"
            placeholder="Tìm giáo trình, học cụ…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>↵</kbd>
        </form>
        <div className="header-actions">
          <Link className="icon-link message-link" to="/tin-nhan" aria-label="Tin nhắn">
            <MessageCircle size={19} />
            <span>Tin nhắn</span>
          </Link>
            {demoStore.currentUserEmail ? <button className="text-link sign-in-link" type="button" onClick={clearDemoAccount}>Đăng xuất</button> : <Link className="text-link sign-in-link" to="/dang-nhap">Đăng nhập</Link>}
          <Link className="button button-primary header-sell" to="/dang-ban">
            <span>Đăng bán</span><ArrowRight size={16} />
          </Link>
        </div>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <div className={`header-bottom ${menuOpen ? 'is-open' : ''}`}>
        <div className="wrap nav-row">
          <nav className="main-nav" aria-label="Điều hướng chính">
            <Link className={location.pathname === '/' ? 'active' : ''} to="/" onClick={() => setMenuOpen(false)}>Chợ sinh viên</Link>
            <Link className={location.pathname === '/cua-hang' ? 'active' : ''} to="/cua-hang" onClick={() => setMenuOpen(false)}>Văn phòng phẩm</Link>
            <Link className={location.pathname === '/huong-dan' ? 'active' : ''} to="/huong-dan" onClick={() => setMenuOpen(false)}>Cách hoạt động</Link>
          </nav>
          <div className="campus-label"><MapPin size={15} /> Cộng đồng NTTU</div>
          <div className="mobile-nav-actions">
            <Link to="/tin-nhan" onClick={() => setMenuOpen(false)}><MessageCircle size={17} /> Tin nhắn</Link>
            {demoStore.currentUserEmail ? <button className="text-link" type="button" onClick={() => { clearDemoAccount(); setMenuOpen(false) }}>Đăng xuất</button> : <Link to="/dang-nhap" onClick={() => setMenuOpen(false)}>Đăng nhập / Đăng ký</Link>}
            <Link className="button button-primary" to="/dang-ban" onClick={() => setMenuOpen(false)}>Đăng bán <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
    </header>
  )
}

function HomePage() {
  const demoStore = useDemoStore()
  const [params] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const momentRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const { items, loading, error } = useListings()
  const query = params.get('q')?.trim().toLocaleLowerCase('vi') ?? ''
  const filtered = useMemo(() => items.filter((item) => {
    const matchesQuery = !query || `${item.title} ${item.category} ${item.description}`.toLocaleLowerCase('vi').includes(query)
    const matchesCategory = activeCategory === 'Tất cả' || item.category === activeCategory
    return matchesQuery && matchesCategory
  }), [items, query, activeCategory])
  const heroListing = items[0]

  useEffect(() => {
    const root = momentRef.current
    if (!root) return
    const runtime = window.stuMarketMoments
    if (!runtime) { root.classList.add('mo-safe'); return }
    let cancelled = false
    let destroy: (() => void) | undefined
    runtime.mount(root).then((mounted) => {
      if (cancelled) return
      destroy = mounted?.destroy
    }).catch(() => root.classList.add('mo-safe'))
    return () => { cancelled = true; destroy?.() }
  }, [])

  return (
    <>
      <section className="home-hero hero" aria-labelledby="home-title" data-enter>
        <div className="wrap hero-grid grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-mark" /> Chợ trực tuyến dành cho NTTU</p>
            <h1 id="home-title">Chợ đồ học tập NTTU</h1>
            <p className="hero-lead">Tìm giáo trình đã qua sử dụng, học cụ và văn phòng phẩm từ sinh viên, cửa hàng trong trường.</p>
            <form className="hero-search" role="search" onSubmit={(event) => {
              event.preventDefault()
              const value = (event.currentTarget.elements.namedItem('hero-query') as HTMLInputElement).value.trim()
              navigate(value ? `/?q=${encodeURIComponent(value)}` : '/')
            }}>
              <Search size={19} aria-hidden="true" />
              <label className="search-field-label" htmlFor="hero-query">Từ khóa</label>
              <input id="hero-query" name="hero-query" aria-label="Từ khóa tìm kiếm" placeholder="Bạn đang tìm gì?" defaultValue={params.get('q') ?? ''} />
              <button className="button button-primary" type="submit">Tìm sản phẩm <ArrowRight size={16} /></button>
            </form>
            <div className="hero-notes">
              <span><ShieldCheck size={16} /> Email chưa được xác minh</span>
              <span><MapPin size={16} /> Liên hệ và giao dịch chưa kết nối</span>
            </div>
          </div>
          <div className="hero-product" data-visual>
            <div className="hero-image-wrap">
              <img src={heroListing?.image ?? publicAsset('images/listing-placeholder.svg')} alt={heroListing?.imageAlt ?? 'Ảnh minh họa sản phẩm sẽ đăng'} />
            </div>
            {heroListing && <div className="hero-product-card">
              <div>
                <span className="hero-product-kicker">Đang tìm chủ nhân mới</span>
                <p className="hero-product-title">{heroListing.title}</p>
              </div>
              <strong>{formatPrice(heroListing.price)}</strong>
            </div>}
          </div>
        </div>
      </section>

      <section className="market-section" aria-labelledby="market-title" id="san-pham">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tìm theo nhu cầu</p>
              <h2 id="market-title">Sản phẩm đang được đăng</h2>
            </div>
            <span className="result-count">{filtered.length} tin đăng</span>
          </div>
          <div className="category-list" role="group" aria-label="Lọc theo danh mục">
            {categories.map((category) => (
              <button
                className={`category-chip ${activeCategory === category ? 'selected' : ''}`}
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'Tất cả' && <Grid2X2 size={14} />}{category}
              </button>
            ))}
          </div>
          {query && <p className="search-context">Kết quả cho <strong>“{params.get('q')}”</strong> <Link to="/">Xóa tìm kiếm</Link></p>}
          {loading ? <div className="empty-results" role="status"><p>Đang tải sản phẩm…</p></div> : error ? <div className="empty-results" role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => window.location.reload()}>Tải lại</button></div> : filtered.length ? (
            <div className="product-grid grid">
              {filtered.map((item, index) => <ProductCard item={item} key={item.id} index={index} />)}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={27} />
              <h3>Chưa có tin phù hợp</h3>
              <p>Thử từ khóa khác hoặc chọn danh mục “Tất cả”.</p>
              <button type="button" className="button button-secondary" onClick={() => { setActiveCategory('Tất cả'); window.location.assign('/') }}>Xem mọi sản phẩm</button>
            </div>
          )}
          <div className="browse-footer"><Link className="text-link" to="/tin-da-luu">Tin đã lưu ({demoStore.favorites.length}) <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section ref={momentRef} className="moment-section mo-la" aria-labelledby="moment-title" data-moment="letters-assemble" data-moment-opts='{"spread":0.75}'>
        <div className="wrap grid">
          <div className="moment-copy span-5"><h2 className="mo-la__type" id="moment-title">Sách dùng tiếp.</h2><p className="mo-la__sub">Giáo trình còn tốt có thể tiếp tục giúp một bạn khác trong lớp.</p><Link className="button button-primary moment-action" to="/#san-pham">Tìm sản phẩm <ArrowRight size={16} /></Link></div>
          <figure className="moment-image span-6 start-7"><img src={items[3]?.image ?? publicAsset('images/listing-placeholder.svg')} alt={items[3]?.imageAlt ?? 'Sách và đồ dùng học tập'} loading="lazy" /></figure>
        </div>
      </section>
    </>
  )
}

function ProductCard({ item, index }: { item: Listing; index: number }) {
  const demoStore = useDemoStore()
  const [notice, setNotice] = useState('')
  const saved = demoStore.favorites.includes(item.id)
  const sold = demoStore.soldIds.includes(item.id)
  return (
    <article className={`product-card span-4 ${index === 1 ? 'product-card-featured' : ''}`}>
      <Link className="product-image m-zoom" to={`/san-pham/${item.id}`} aria-label={`Xem ${item.title}`}>
        <img src={item.image} alt={item.imageAlt} loading="lazy" />
      </Link>
      <button className={`save-button ${saved ? 'is-saved' : ''}`} type="button" aria-label={saved ? 'Bỏ lưu tin' : 'Lưu tin'} aria-pressed={saved} onClick={() => setNotice(toggleDemoFavorite(item.id) === null ? 'Không lưu được thay đổi. Hãy kiểm tra dung lượng trình duyệt.' : '')}>
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <div className="product-info">
        <div className="product-meta"><span>{item.category}</span><span className="product-condition-text">{sold ? 'Đã bán' : item.conditionShort}</span><span className="product-location"><MapPin size={12} /> {item.location}</span></div>
        <Link className="product-title" to={`/san-pham/${item.id}`}>{item.title}</Link>
        <p className="product-description">{item.description}</p>
        {notice && <span className="product-save-notice" role="status">{notice}</span>}
        <div className="product-bottom"><strong>{formatPrice(item.price)}</strong><span className={`seller-tag ${item.sellerKind === 'Cửa hàng' ? 'seller-tag-store' : ''}`}>{item.sellerKind === 'Cửa hàng' ? <Store size={13} /> : <BadgeCheck size={13} />}{item.sellerKind}</span></div>
      </div>
    </article>
  )
}

function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [actionNotice, setActionNotice] = useState('')
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const { items, loading, error } = useListings()
  const item = items.find((listing) => listing.id === id)
  const demoStore = useDemoStore()
  const saved = Boolean(item && demoStore.favorites.includes(item.id))
  const isOwner = Boolean(item?.sellerEmail && item.sellerEmail === demoStore.currentUserEmail)
  if (loading) return <EmptyPage title="Đang tải sản phẩm" body="Vui lòng đợi trong giây lát." />
  if (error) return <EmptyPage title="Chưa tải được sản phẩm" body={error} />
  if (!item) return <EmptyPage title="Không tìm thấy sản phẩm" body="Tin đăng có thể đã được gỡ hoặc không còn khả dụng." />

  return (
    <section className="content-page wrap hero" data-enter>
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Quay lại chợ</Link>
      <div className="detail-layout">
        <div className="detail-photo"><img src={item.image} alt={item.imageAlt} /></div>
        <div className="detail-copy">
          <div className="detail-category"><span>{item.category}</span><span>·</span><span>{item.location}</span></div>
          <h1>{item.title}</h1>
          <p className="detail-price">{formatPrice(item.price)}</p>
          <div className="detail-facts"><span><Check size={15} /> {item.condition}</span><span><MapPin size={15} /> {item.location}</span></div>
          <p className="detail-description">{item.descriptionLong}</p>
          <div className="seller-profile">
            <div className="seller-avatar">{item.sellerKind === 'Cửa hàng' ? <Store size={19} /> : <BookOpen size={19} />}</div>
            <div><strong>{item.sellerName ?? `${item.sellerKind} NTTU`}</strong><span>{item.sellerKind === 'Cửa hàng' ? 'Tài khoản cửa hàng' : 'Tài khoản sinh viên'}</span></div>
            {item.sellerEmailVerified && <span className="verified-label"><BadgeCheck size={15} /> Email NTTU đã xác minh</span>}
          </div>
          <div className="detail-actions">
            <button className="button button-primary" type="button" disabled={isDemoListingSold(item.id) || isOwner} onClick={() => {
              if (!demoStore.currentUserEmail) { navigate(`/dang-nhap?redirect=${encodeURIComponent(`/san-pham/${item.id}`)}`); return }
              setPurchaseOpen((open) => !open)
            }}><ShoppingBag size={17} /> {isOwner ? 'Tin của bạn' : isDemoListingSold(item.id) ? 'Tin đã bán' : 'Yêu cầu mua'}</button>
            <button className="button button-secondary" type="button" disabled={isDemoListingSold(item.id) || isOwner} onClick={() => {
              if (!demoStore.currentUserEmail) { navigate(`/dang-nhap?redirect=${encodeURIComponent(`/san-pham/${item.id}`)}`); return }
              const threadId = startDemoConversation(item)
              if (threadId) navigate(`/tin-nhan?thread=${encodeURIComponent(threadId)}`)
              else setActionNotice('Thiết bị không còn đủ dung lượng để lưu cuộc trò chuyện.')
            }}><MessageCircle size={17} /> Nhắn người bán</button>
            <button className={`button button-secondary ${saved ? 'is-saved' : ''}`} type="button" onClick={() => setActionNotice(toggleDemoFavorite(item.id) === null ? 'Không lưu được thay đổi. Hãy kiểm tra dung lượng trình duyệt.' : '')}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Đã lưu tin' : 'Lưu tin'}</button>
          </div>
          {purchaseOpen && <form className="purchase-panel" onSubmit={(event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            const threadId = requestDemoPurchase(item, String(form.get('fulfillment')), String(form.get('payment')))
            if (!threadId) { setActionNotice('Không tạo được yêu cầu mua. Tin có thể đã bán hoặc bộ nhớ trình duyệt đã đầy.'); return }
            navigate(`/tin-nhan?thread=${encodeURIComponent(threadId)}`)
          }}>
            <h2>Thông tin yêu cầu mua</h2>
            <p>Chọn cách giao nhận và thanh toán dự kiến. Chưa có khoản thanh toán nào được thực hiện.</p>
            <label className="purchase-field">Giao nhận
              <select name="fulfillment" defaultValue="Gặp trực tiếp tại trường NTTU">
                <option>Gặp trực tiếp tại trường NTTU</option><option>Thỏa thuận địa điểm khác</option>
              </select>
            </label>
            <label className="purchase-field">Thanh toán
              <select name="payment" defaultValue="Tiền mặt khi nhận hàng">
                <option>Tiền mặt khi nhận hàng</option><option>Thỏa thuận trực tiếp</option>
              </select>
            </label>
            <button className="button button-primary" type="submit">Gửi yêu cầu mua · {formatPrice(item.price)} <ArrowRight size={16} /></button>
            <span className="purchase-local-note">Yêu cầu chỉ lưu trên trình duyệt này, người bán chưa nhận được thông báo.</span>
          </form>}
          {actionNotice && <div className="form-notice" role="status"><ShieldCheck size={18} /> {actionNotice}</div>}
          {isOwner && !isDemoListingSold(item.id) && <button className="demo-sold-button" type="button" onClick={() => { if (!markDemoListingSold(item.id)) setActionNotice('Không lưu được trạng thái tin. Hãy kiểm tra dung lượng trình duyệt.') }}>Đánh dấu tin đã bán</button>}
          {isOwner && isDemoListingSold(item.id) && <div className="demo-rating"><strong>Đánh giá giao dịch</strong><div role="group" aria-label="Chọn số sao đánh giá">{[1, 2, 3, 4, 5].map((star) => <button key={star} className={star <= (demoStore.ratings[item.id] ?? 0) ? 'is-rated' : ''} type="button" aria-label={`${star} sao`} aria-pressed={star === demoStore.ratings[item.id]} onClick={() => { if (!rateDemoTransaction(item.id, star)) setActionNotice('Không lưu được đánh giá. Hãy kiểm tra dung lượng trình duyệt.') }}>★</button>)}</div>{demoStore.ratings[item.id] ? <span>Đã chọn {demoStore.ratings[item.id]} sao. Đánh giá lưu trên thiết bị này.</span> : <span>Đánh giá chỉ lưu trên thiết bị này.</span>}</div>}
          <p className="detail-safety"><ShieldCheck size={17} /> Hẹn gặp nơi công cộng trong trường và kiểm tra sản phẩm trước khi thanh toán.</p>
        </div>
      </div>
          <div className="detail-note"><strong>Lưu ý về tin đăng</strong><p>Một số sản phẩm và cửa hàng là thông tin minh họa. Yêu cầu mua, tin nhắn và đánh giá chỉ lưu trên trình duyệt này; người bán chưa nhận được thông báo. Website không xử lý thanh toán, hãy chỉ trả tiền khi đã nhận và kiểm tra sản phẩm trực tiếp.</p></div>
    </section>
  )
}

function SavedPage() {
  const demoStore = useDemoStore()
  const { items } = useListings()
  const savedItems = items.filter((item) => demoStore.favorites.includes(item.id))
  return <section className="content-page wrap hero" data-enter>
    <div className="page-intro"><p className="eyebrow">Đã lưu trên thiết bị</p><h1>Những món bạn muốn xem lại.</h1><p>Danh sách này chỉ có trong trình duyệt hiện tại.</p></div>
    {savedItems.length ? <div className="product-grid grid">{savedItems.map((item, index) => <ProductCard item={item} key={item.id} index={index} />)}</div> : <div className="empty-results"><Heart size={26} /><h3>Chưa lưu tin nào</h3><p>Chọn biểu tượng trái tim trên sản phẩm để thêm vào danh sách này.</p><Link className="button button-primary" to="/#san-pham">Tìm sản phẩm <ArrowRight size={16} /></Link></div>}
  </section>
}

function SellPage() {
  const [notice, setNotice] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [busy, setBusy] = useState(false)
  const demoStore = useDemoStore()
  const navigate = useNavigate()
  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setNotice('Ảnh cần là JPG, PNG hoặc WebP và có dung lượng tối đa 5 MB.')
      event.target.value = ''
      return
    }
    setNotice('')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const fileInput = form.elements.namedItem('product-image') as HTMLInputElement
    const file = fileInput.files?.[0]
    setBusy(true)
    setNotice('')
    try {
      const image = file ? await compressDemoImage(file) : publicAsset('images/listing-placeholder.svg')
      const title = String(formData.get('title') ?? '').trim()
      const condition = String(formData.get('condition') ?? '')
      const item = addDemoListing({
        title,
        category: String(formData.get('category') ?? ''),
        condition,
        conditionShort: condition === 'Mới' ? 'Mới' : condition.includes('ghi chú') ? 'Có ghi chú' : 'Còn tốt',
        price: Number(formData.get('price')),
        location: String(formData.get('campus') ?? '') || 'NTTU',
        description: String(formData.get('description') ?? '').trim() || 'Chưa có mô tả chi tiết.',
        descriptionLong: String(formData.get('description') ?? '').trim() || 'Chưa có mô tả chi tiết. Vui lòng liên hệ người đăng để biết thêm thông tin.',
        image,
        imageAlt: title,
      })
      if (!item) {
        setNotice('Bộ nhớ trên thiết bị đã đầy. Hãy xóa dữ liệu trang web trong trình duyệt rồi thử lại.')
        return
      }
      navigate(`/san-pham/${item.id}`)
    } catch {
      setNotice('Chưa lưu được tin. Hãy chọn ảnh nhỏ hơn hoặc bỏ ảnh rồi đăng lại.')
    } finally {
      setBusy(false)
    }
  }
  if (!demoStore.currentUserEmail) return (
    <section className="empty-page wrap hero" data-enter>
      <div className="empty-icon"><BookOpenCheck size={25} /></div>
      <h1>Đăng nhập để đăng bán.</h1>
      <p>Tạo tài khoản hoặc đăng nhập để tin đăng được gắn với tài khoản trên thiết bị này.</p>
      <Link className="button button-primary" to="/dang-nhap?mode=register&redirect=%2Fdang-ban">Đăng ký / Đăng nhập <ArrowRight size={16} /></Link>
    </section>
  )
  return (
    <section className="content-page wrap sell-page hero" data-enter>
      <div className="page-intro"><p className="eyebrow">Đăng bán</p><h1>Đưa món đồ học tập lên chợ.</h1><p>Tin chỉ được lưu trong trình duyệt này; chưa hiển thị cho người dùng khác.</p></div>
      {!demoStore.currentUserEmail && <div className="form-notice"><ShieldCheck size={18} /> Đăng nhập để tin mới hiển thị tên tài khoản của bạn. Chưa có tài khoản? Đăng ký miễn phí.</div>}
      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="form-section"><div className="form-section-heading"><span>01</span><div><h2>Thông tin sản phẩm</h2><p>Mô tả chính xác tình trạng hiện tại.</p></div></div>
          <label className="field"><span>Tên sản phẩm <b>*</b></span><input name="title" required minLength={3} maxLength={90} placeholder="Ví dụ: Giáo trình Marketing căn bản" /></label>
          <div className="field-row"><label className="field"><span>Danh mục <b>*</b></span><select name="category" required defaultValue=""><option value="" disabled>Chọn danh mục</option>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="field"><span>Tình trạng <b>*</b></span><select name="condition" required defaultValue=""><option value="" disabled>Chọn tình trạng</option><option>Mới</option><option>Đã qua sử dụng · còn tốt</option><option>Đã qua sử dụng · có ghi chú</option></select></label></div>
          <div className="field-row"><label className="field"><span>Giá bán <b>*</b></span><div className="price-input"><input name="price" required type="number" min="0" max="1000000000" step="1000" placeholder="50.000" /><span>đ</span></div></label>
            <label className="field"><span>Cơ sở gợi ý</span><select name="campus" defaultValue=""><option value="">Chọn cơ sở</option><option>Quận 4</option><option>Quận 7</option><option>Quận 12</option><option>An Phú Đông</option></select></label></div>
          <label className="field"><span>Mô tả</span><textarea name="description" rows={4} maxLength={1200} placeholder="Ghi rõ phiên bản, ghi chú, phụ kiện hoặc điểm cần lưu ý…" /></label>
        </div>
        <div className="form-section"><div className="form-section-heading"><span>02</span><div><h2>Ảnh sản phẩm</h2><p>Ảnh thật giúp người mua kiểm tra trước khi liên hệ.</p></div></div>
          <label className="upload-box">{imagePreview ? <img className="upload-preview" src={imagePreview} alt="Ảnh xem trước sản phẩm" /> : <><span className="upload-icon"><ShoppingBag size={22} /></span><strong>Chọn ảnh từ thiết bị (không bắt buộc)</strong><span>JPG, PNG hoặc WebP · tối đa 5 MB</span></>}<input name="product-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} /></label>
        </div>
        {notice && <div className="form-notice" role="status"><ShieldCheck size={18} /> {notice}</div>}
        <div className="form-submit"><p>Tin và ảnh đã nén chỉ được lưu trên thiết bị đang dùng.</p><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Đang lưu tin…' : 'Đăng sản phẩm'} <ArrowRight size={16} /></button></div>
      </form>
    </section>
  )
}

function ShopPage() {
  const { items } = useListings()
  const storeItems = items.filter((item) => item.sellerKind === 'Cửa hàng')
  return (
    <section className="content-page wrap shop-page hero" data-enter>
      <div className="shop-cover"><div className="shop-cover-mark"><Store size={31} /></div><span>Gian hàng</span></div>
      <div className="shop-header"><div><p className="eyebrow">Cửa hàng văn phòng phẩm</p><h1>Học cụ cho ngày đến lớp.</h1><p>Danh mục mẫu dành cho gian hàng đối tác StuMarket.</p></div><span className="store-status"><BadgeCheck size={15} /> Cửa hàng</span></div>
      <div className="shop-categories"><span>Bút và viết</span><span>Vở và sổ</span><span>Giấy</span><span>File tài liệu</span><span>Máy tính cầm tay</span><span>Dụng cụ học tập</span></div>
      <div className="section-heading shop-products-heading"><div><p className="eyebrow">Danh mục hàng hóa</p><h2>Sản phẩm văn phòng phẩm</h2></div><span className="result-count">{storeItems.length} sản phẩm</span></div>
      {storeItems.length ? <div className="product-grid grid">{storeItems.map((item, index) => <ProductCard item={item} key={item.id} index={index} />)}</div> : <div className="empty-results"><p>Chưa có sản phẩm từ cửa hàng.</p></div>}
      <div className="form-notice shop-notice"><ShieldCheck size={18} /> Gian hàng và sản phẩm hiện là thông tin minh họa, chưa kết nối cửa hàng thật.</div>
    </section>
  )
}

function MessagesPage() {
  const demoStore = useDemoStore()
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState('')
  const requestedId = params.get('thread')
  const selectedId = demoStore.conversations.some((thread) => thread.id === requestedId)
    ? requestedId ?? ''
    : demoStore.conversations[0]?.id ?? ''
  const selected = demoStore.conversations.find((thread) => thread.id === selectedId)

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const form = event.currentTarget
    const data = new FormData(form)
    const text = String(data.get('message') ?? '').trim()
    if (!text) return
    if (!sendDemoMessage(selected.id, text)) {
      setNotice('Không lưu được tin nhắn. Hãy kiểm tra dung lượng trình duyệt rồi thử lại.')
      return
    }
    setNotice('')
    form.reset()
    window.setTimeout(() => {
      if (!replyDemoMessage(selected.id, 'Đây là phản hồi tự động. Người bán chưa nhận được tin nhắn này.')) {
        setNotice('Tin nhắn của bạn đã lưu, nhưng không lưu được phản hồi tự động.')
      }
    }, 650)
  }

  return (
    <section className="content-page wrap messages-page hero" data-enter>
      <div className="page-intro"><p className="eyebrow">Tin nhắn</p><h1>Trao đổi về sản phẩm.</h1><p>Tin nhắn lưu trong trình duyệt này; người bán chưa nhận được nội dung bạn gửi.</p></div>
      {notice && <div className="form-notice" role="status"><ShieldCheck size={18} /> {notice}</div>}
      {demoStore.conversations.length ? <div className="demo-chat-layout">
        <aside className="demo-thread-list" aria-label="Các cuộc trao đổi">{demoStore.conversations.map((thread) => <button key={thread.id} type="button" className={`demo-thread ${thread.id === selectedId ? 'is-selected' : ''}`} onClick={() => setParams({ thread: thread.id })}><strong>{thread.title}</strong><span>{thread.sellerName}</span><small>{thread.messages.at(-1)?.text}</small></button>)}</aside>
        {selected && <div className="demo-chat"><div className="demo-chat-heading"><div><strong>{selected.sellerName}</strong><span>{selected.title} · {formatPrice(selected.price)}</span></div><Link to={`/san-pham/${selected.listingId}`}>Xem tin</Link></div>
          {selected.purchase && <div className="purchase-order-card"><div><strong>Yêu cầu mua · {selected.purchase.status === 'completed' ? 'Đã nhận hàng' : 'Chờ xác nhận giao dịch'}</strong><span>{selected.purchase.fulfillment} · {selected.purchase.payment}</span></div>
            {selected.purchase.status === 'requested' && selected.purchase.buyerEmail === demoStore.currentUserEmail && <button className="button button-secondary" type="button" onClick={() => { if (!completeDemoPurchase(selected.id)) setNotice('Chưa thể xác nhận giao dịch này.') }}>Xác nhận đã nhận hàng</button>}
            {selected.purchase.status === 'completed' && selected.purchase.buyerEmail === demoStore.currentUserEmail && <div className="purchase-rating"><strong>Đánh giá giao dịch</strong><div role="group" aria-label="Đánh giá người bán">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className={star <= (selected.purchase?.rating ?? 0) ? 'is-rated' : ''} aria-label={`${star} sao`} aria-pressed={selected.purchase?.rating === star} onClick={() => { if (!rateDemoPurchase(selected.id, star)) setNotice('Không lưu được đánh giá.') }}>★</button>)}</div></div>}
          </div>}
          <div className="demo-chat-messages" aria-live="polite">{selected.messages.map((message) => <div key={message.id} className={`demo-message ${message.mine ? 'mine' : ''}`}><p>{message.text}</p><time>{new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time></div>)}</div>
          <form className="demo-chat-composer" onSubmit={submitMessage}><label className="visually-hidden" htmlFor="demo-message">Tin nhắn</label><input id="demo-message" name="message" maxLength={500} placeholder="Viết tin nhắn…" /><button className="button button-primary" type="submit" aria-label="Gửi tin nhắn"><ArrowRight size={18} /></button></form>
        </div>}
      </div> : <div className="empty-results"><MessageCircle size={27} /><h3>Chưa có cuộc trao đổi</h3><p>Mở một sản phẩm và chọn “Nhắn người bán” để soạn tin nhắn. Tin nhắn chưa được gửi đến người bán.</p><Link className="button button-primary" to="/">Tìm sản phẩm <ArrowRight size={16} /></Link></div>}
    </section>
  )
}

function LoginPage() {
  const demoStore = useDemoStore()
  const [params] = useSearchParams()
  const redirectTo = params.get('redirect')
  const destination = redirectTo?.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/'
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [name, setName] = useState(demoStore.demoName)
  const [email, setEmail] = useState(demoStore.currentUserEmail)
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      const result = mode === 'register'
        ? await registerDemoAccount(email, name, password)
        : await loginDemoAccount(email, password)
      if (!result.ok) { setNotice(result.error); return }
      navigate(destination)
    } catch {
      setNotice('Trình duyệt chưa hỗ trợ tạo tài khoản. Hãy cập nhật trình duyệt rồi thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page hero" data-enter>
      <div className="auth-card">
        <div className="auth-icon"><BookOpenCheck size={24} /></div>
        <p className="eyebrow">Tài khoản StuMarket</p>
        <h1>{mode === 'register' ? 'Tạo tài khoản mới.' : 'Chào mừng bạn trở lại.'}</h1>
        <p className="auth-description">{mode === 'register' ? 'Tạo tài khoản để bắt đầu sử dụng StuMarket.' : 'Đăng nhập vào tài khoản đã tạo trên trình duyệt này.'}</p>
        <div className="auth-mode-switch" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setNotice('') }}>Đăng nhập</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setNotice('') }}>Đăng ký</button>
        </div>
        <form className="auth-form" onSubmit={handleAuth}>
          {mode === 'register' && <label className="field"><span>Tên hiển thị <b>*</b></span><input required maxLength={32} minLength={2} placeholder="Ví dụ: Minh Anh" value={name} onChange={(event) => setName(event.target.value)} /></label>}
          <label className="field"><span>Email <b>*</b></span><input required type="email" autoComplete="email" placeholder="ban@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="field"><span>Mật khẩu <b>*</b></span><input required type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={72} placeholder="Tối thiểu 8 ký tự" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {notice && <div className="form-notice" role="status"><ShieldCheck size={18} /> {notice}</div>}
          <button className="button button-primary button-wide" type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-note"><ShieldCheck size={16} /> Tài khoản chỉ lưu trên thiết bị này, không xác minh email và không đồng bộ. Không dùng mật khẩu thật hoặc mật khẩu đang dùng ở nơi khác.</p>
      </div>
    </section>
  )
}

function GuidePage() {
  return (
    <section className="content-page wrap guide-page hero" data-enter>
      <div className="page-intro"><p className="eyebrow">Cách hoạt động</p><h1>Khám phá chợ sinh viên.</h1><p>Tìm sản phẩm, đăng tin và trao đổi với người bán. Thông tin đã tạo hiện chỉ lưu trên trình duyệt này.</p></div>
      <div className="guide-flow"><span>Tạo tài khoản</span><ArrowRight size={16} /><span>Tìm / đăng tin</span><ArrowRight size={16} /><span>Nhắn tin</span><ArrowRight size={16} /><span>Đánh dấu đã bán</span><ArrowRight size={16} /><span>Đánh giá</span></div>
      <div className="guide-columns">
        <article className="guide-card"><p className="eyebrow">Dành cho người mua</p><h2>Tìm và lưu sản phẩm.</h2><ol><li>Tìm sản phẩm theo tên hoặc danh mục.</li><li>Mở tin để xem giá, ảnh và tình trạng.</li><li>Lưu tin bằng biểu tượng trái tim để xem lại.</li><li>Soạn tin nhắn cho người bán.</li><li>Chỉ giao dịch sau khi xác nhận người bán và thông tin sản phẩm.</li></ol></article>
        <article className="guide-card"><p className="eyebrow">Dành cho người bán</p><h2>Đăng một tin mới.</h2><ol><li>Đăng ký hoặc đăng nhập tài khoản.</li><li>Thêm tiêu đề, danh mục, giá, tình trạng và ảnh tùy chọn.</li><li>Tin mới được lưu trên thiết bị hiện tại.</li><li>Mở tin của mình để đánh dấu đã bán.</li><li>Chọn số sao để lưu đánh giá.</li></ol></article>
      </div>
      <div className="guide-note"><ShieldCheck size={19} /><div><strong>Một số thông tin trên trang chỉ dùng để minh họa giao diện.</strong><p>Tài khoản, tin đăng, ảnh, tin nhắn và đánh giá chỉ lưu trong trình duyệt này; người bán chưa nhận được tin nhắn và tài khoản chưa xác minh email.</p></div></div>
    </section>
  )
}

function EmptyPage({ title, body, icon, action }: { title: string; body: string; icon?: ReactNode; action?: ReactNode }) {
  return <section className="empty-page wrap hero" data-enter><div className="empty-icon">{icon ?? <BookOpen size={25} />}</div><h1>{title}</h1><p>{body}</p>{action}</section>
}

function Footer() {
  const location = useLocation()
  return (
    <footer className="site-footer">
      <div className="wrap footer-content">
      {location.pathname === '/' ? null : <FooterMoment key={location.pathname} />}
      <section className="footer-close" aria-labelledby="footer-close-title">
        <div><p className="eyebrow">StuMarket · Cộng đồng NTTU</p><h2 id="footer-close-title">Đăng lại đồ học tập đang còn dùng tốt.</h2><p>Thêm ảnh và thông tin rõ ràng để người mua biết mình đang tìm gì.</p></div>
        <Link className="button button-primary" to="/dang-ban">Đăng bán <ArrowRight size={16} /></Link>
      </section>
      <div className="footer-main grid">
        <div className="footer-brand span-5"><Brand /><p>Chợ trực tuyến cho giáo trình, học cụ và văn phòng phẩm dành cho cộng đồng NTTU.</p></div>
        <div className="footer-links span-3 start-7"><strong>StuMarket</strong><Link to="/">Chợ sinh viên</Link><Link to="/tin-da-luu">Tin đã lưu</Link><Link to="/cua-hang">Văn phòng phẩm</Link><Link to="/huong-dan">Cách hoạt động</Link></div>
        <div className="footer-links span-3 start-10"><strong>Tài khoản</strong><Link to="/dang-nhap">Đăng nhập</Link><Link to="/dang-ban">Đăng bán</Link><Link to="/tin-nhan">Tin nhắn</Link></div>
      </div>
      <div className="footer-bottom"><span>© 2026 StuMarket NTTU</span><span>Dữ liệu chỉ lưu trong trình duyệt này.</span></div>
      </div>
    </footer>
  )
}

function FooterMoment() {
  const momentRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = momentRef.current
    if (!root) return
    const runtime = window.stuMarketMoments
    if (!runtime) { root.classList.add('mo-safe'); return }
    let cancelled = false
    let destroy: (() => void) | undefined
    runtime.mount(root).then((mounted) => {
      if (cancelled) return
      destroy = mounted?.destroy
    }).catch(() => root.classList.add('mo-safe'))
    return () => { cancelled = true; destroy?.() }
  }, [])

  return (
    <section ref={momentRef} className="footer-moment mo-la" data-moment="letters-assemble" aria-labelledby="footer-moment-title">
      <h2 className="mo-la__type" id="footer-moment-title">Sách dùng tiếp.</h2>
      <p className="mo-la__sub">Mua bán giáo trình và học cụ trong cộng đồng NTTU.</p>
      <Link className="button button-primary moment-action" to="/#san-pham">Tìm sản phẩm <ArrowRight size={16} /></Link>
    </section>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price)
}

async function compressDemoImage(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Không đọc được ảnh'))
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.readAsDataURL(file)
  })
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Ảnh không hợp lệ'))
    element.src = source
  })
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Không xử lý được ảnh')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.76)
}

export default App
