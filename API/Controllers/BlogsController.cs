using API.Data;
using API.DTO;
using API.Entity;
using API.Filters;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private const long UploadRequestLimit = ImageValidator.MaxSize + 1024 * 1024;

    private readonly DataContext _context;
    private readonly IWebHostEnvironment _env;

    public BlogsController(DataContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllBlogs()
    {
        var blogs = await _context.Blogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedDate)
            .Select(x => new ListBlogDTO
            {
                Id = x.Id,
                Title = x.Title,
                Img = x.Img,
                CreatedDate = x.CreatedDate
            })
            .ToListAsync();

        return Ok(blogs);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBlog(int id)
    {
        var blog = await _context.Blogs.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (blog == null)
            return NotFound(new { message = "Blog bulunamadı." });

        return Ok(new BlogDetailDTO
        {
            Id = blog.Id,
            Title = blog.Title,
            Img = blog.Img,
            Description = HtmlContentSanitizer.Sanitize(blog.Description),
            CreatedDate = blog.CreatedDate,
            UpdatedDate = blog.UpdatedDate
        });
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateBlog([FromForm] CreateBlogDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var title = dto.Title.Trim();
        if (title.Length == 0)
            return BadRequest(new { message = "Başlık zorunludur." });

        var content = HtmlContentSanitizer.Sanitize(dto.Description);
        if (HtmlContentSanitizer.ToPlainText(content).Length == 0)
            return BadRequest(new { message = "Blog içeriği zorunludur." });

        var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Image);
        if (imageError != null)
            return BadRequest(new { message = imageError });

        var blog = new Blog
        {
            Title = title,
            Img = await SaveImage(dto.Image!, extension!),
            Description = content,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Blog oluşturuldu.", id = blog.Id });
    }

    [HttpPut("{id}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateBlog(int id, [FromForm] UpdateBlogDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null)
            return NotFound(new { message = "Blog bulunamadı." });

        if (!string.IsNullOrWhiteSpace(dto.Title))
            blog.Title = dto.Title.Trim();

        if (dto.Description != null)
        {
            var content = HtmlContentSanitizer.Sanitize(dto.Description);
            if (HtmlContentSanitizer.ToPlainText(content).Length == 0)
                return BadRequest(new { message = "Blog içeriği boş olamaz." });

            blog.Description = content;
        }

        string? oldImage = null;
        if (dto.Image != null)
        {
            var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Image);
            if (imageError != null)
                return BadRequest(new { message = imageError });

            oldImage = blog.Img;
            blog.Img = await SaveImage(dto.Image, extension!);
        }

        blog.UpdatedDate = DateTime.Now;
        await _context.SaveChangesAsync();

        DeleteUpload(oldImage);

        return Ok(new { message = "Blog güncellendi." });
    }

    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteBlog(int id)
    {
        var blog = await _context.Blogs.FindAsync(id);
        if (blog == null)
            return NotFound(new { message = "Blog bulunamadı." });

        var image = blog.Img;

        _context.Blogs.Remove(blog);
        await _context.SaveChangesAsync();

        DeleteUpload(image);

        return Ok(new { message = "Blog silindi." });
    }

    private async Task<string> SaveImage(IFormFile file, string extension)
    {
        var directory = Path.Combine(_env.WebRootPath, "img", "blogs");
        Directory.CreateDirectory(directory);

        var fileName = Guid.NewGuid() + extension;
        await using var stream = new FileStream(Path.Combine(directory, fileName), FileMode.CreateNew);
        await file.CopyToAsync(stream);

        return $"blogs/{fileName}";
    }

    private void DeleteUpload(string? image)
    {
        if (string.IsNullOrEmpty(image)) return;

        var blogsDir = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", "blogs"));
        var path = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", image));
        var isUpload = Guid.TryParse(Path.GetFileNameWithoutExtension(path), out _);

        if (isUpload && path.StartsWith(blogsDir + Path.DirectorySeparatorChar) && System.IO.File.Exists(path))
            System.IO.File.Delete(path);
    }
}