using API.Data;
using API.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

// [Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly DataContext _context;
    public BlogsController(DataContext context)
    {
        _context = context;
    }


    [HttpGet]
    public async Task<IActionResult> GetAllBlogs()
    {
        var blogs = await _context.Blogs
            .Select(x => new ListBlogDTO
            {
                Id = x.Id,
                Title = x.Title,
                Img = x.Img,
                CreatedDate = x.CreatedDate,
            }).ToListAsync();

        return Ok(blogs);
    }



    [HttpGet("{id}")]
    public async Task<IActionResult> GetBlog(int id)
    {
        var blog = await _context.Blogs
            .FirstOrDefaultAsync(x => x.Id == id);

        if (blog == null)
            return NotFound("Blog bulunamadı.");

        var result = new BlogDetailDTO
        {
            Id = blog.Id,
            Title = blog.Title,
            Img = blog.Img,
            Description = blog.Description,
            CreatedDate = blog.CreatedDate,
            UpdatedDate = blog.UpdatedDate,
        };

        return Ok(result);
    }


    [HttpPost]
    public async Task<IActionResult> CreateBlog([FromForm] CreateBlogDTO dto)
    {
        var uploadPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot/img/blogs"
        );

        var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);

        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.Image.CopyToAsync(stream);
        }

        var blog = new Blog
        {
            Title = dto.Title,
            Img = "blogs/" + fileName,
            Description = dto.Description,
            CreatedDate = DateTime.Now,
            UpdatedDate = DateTime.Now
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();

        return Ok();
    }



    [HttpPut]
    public async Task<IActionResult> UpdateBlog([FromForm] UpdateBlogDTO dto)
    {
        var blog = await _context.Blogs.FindAsync(dto.Id);

        if (blog == null)
            return NotFound("Blog bulunamadı");

        if (!string.IsNullOrEmpty(dto.Title))
        {
            blog.Title = dto.Title;
        }

        if (!string.IsNullOrEmpty(dto.Description))
        {
            blog.Description = dto.Description;
        }

        // IMAGE 
        if (dto.Image != null)
        {
            var uploadPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot/img/blogs"
            );

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            blog.Img = "blogs/" + fileName;
        }

        blog.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok("Blog güncellendi");
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBlog(int id)
    {
        var blog = await _context.Blogs.FindAsync(id);

        if (blog == null)
            return NotFound("Blog bulunamadı");

        // IMAGE DELETE
        if (!string.IsNullOrEmpty(blog.Img))
        {
            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot/img/blogs",
                blog.Img
            );

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.Blogs.Remove(blog);
        await _context.SaveChangesAsync();

        return Ok("Blog silindi");
    }

}