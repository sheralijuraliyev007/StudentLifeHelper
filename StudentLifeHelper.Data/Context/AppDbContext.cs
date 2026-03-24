using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }


        public DbSet<User> Users { get; set; }

        public DbSet<ContentType> ContentTypes { get; set; }
        
        public DbSet<Country> Countries { get; set; }


    }
